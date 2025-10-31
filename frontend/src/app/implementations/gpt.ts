// Self-contained GPT mock with minimal local types and proxy shim
const DEFAULT_GPT_MODEL = 'gpt-4o-mini';
const MEDIUM_GPT_MODEL = 'gpt-4o-mini';

type ProxyResponse<T> = { success: boolean; data: T };
type ChatCompletionResponse = {
    choices?: Array<{ message?: { content?: string; tool_calls?: any[] } }>;
};
type OpenAIResponse = {
    id?: string;
    status?: string;
    error?: { message?: string } | unknown;
    output?: Array<{
        type?: string;
        content?: Array<{ type?: string; text?: string; annotations?: any[] }>;
    }>;
    incomplete_details?: { reason?: string };
};

const callProxy = async (args: {
    service: string;
    operation: string;
    payload?: any;
}): Promise<ProxyResponse<any>> => {
    const { service, operation, payload } = args;

    const makeEcho = (text: string) =>
        `Echo (${operation}${
            payload?.model ? `:${payload.model}` : ''
        }): ${text}`;

    if (service === 'openai' && operation === 'chat_completion') {
        const lastMsg = payload?.messages?.[payload.messages.length - 1];
        const content = lastMsg?.content ?? '';
        return { success: true, data: { choices: [{ message: { content } }] } };
    }

    if (service === 'openai' && operation === 'responses_create') {
        const inputText =
            typeof payload?.input === 'string'
                ? payload.input
                : Array.isArray(payload?.input)
                ? payload.input
                      .map((m: any) => m?.content?.[0]?.text)
                      .filter(Boolean)
                      .join('\n')
                : payload?.text || '';
        const text =
            typeof inputText === 'string'
                ? inputText
                : JSON.stringify(inputText);
        return {
            success: true,
            data: {
                id: `local_${Date.now()}`,
                status: 'completed',
                output: [
                    {
                        type: 'message',
                        content: [
                            { type: 'output_text', text: makeEcho(text) },
                        ],
                    },
                ],
            },
        };
    }

    if (service === 'arcade' && operation === 'get_formatted_tools') {
        return { success: true, data: [] };
    }

    if (service === 'arcade' && operation === 'execute_tool') {
        return { success: true, data: { output: { ok: true } } };
    }

    if (service === 'arcade' && operation === 'authorize_tool') {
        return { success: true, data: { status: 'completed', id: 'local' } };
    }

    if (service === 'arcade' && operation === 'wait_for_auth_completion') {
        return { success: true, data: { status: 'completed' } };
    }

    return { success: true, data: {} };
};

// Types
export type ChatMessage = {
    role: 'user' | 'assistant' | 'system';
    content: string;
};

// Types that match the OpenAI API
type InputText = {
    type: 'input_text';
    text: string;
};

type InputImage = {
    type: 'input_image';
    image_url: string;
};

type MessageContent = InputText | InputImage;

type MessageInput = {
    role: 'user' | 'assistant' | 'system';
    content: MessageContent[];
};

/**
 * Store chat history internally with associated response IDs for proper stateful chats
 */
interface ChatSession {
    messages: ChatMessage[];
    lastResponseId?: string;
}

const chatSessions = new Map<string, ChatSession>();

// ================================
// ARCADE TOOLS INTEGRATION
// ================================

// No longer need Arcade client here - will use proxy instead

/**
 * Helper function to handle API errors with improved error handling
 */
const handleError = (response: OpenAIResponse) => {
    if (!response) {
        throw new Error('No response received from API');
    }

    if (response.error) {
        throw new Error(response.error.message || 'Unknown API error');
    }

    if (response.status === 'failed' || response.status === 'incomplete') {
        const errorMessage =
            response.error &&
            typeof response.error === 'object' &&
            'message' in response.error
                ? (response.error as { message: string }).message
                : undefined;
        const incompleteReason =
            response.incomplete_details &&
            typeof response.incomplete_details === 'object' &&
            'reason' in response.incomplete_details
                ? (response.incomplete_details as { reason: string }).reason
                : undefined;
        throw new Error(errorMessage || incompleteReason || 'Request failed');
    }

    return response;
};

/**
 * Helper to extract text from the response
 */
const extractText = (response: OpenAIResponse): string => {
    if (!response?.output || response.output.length === 0) {
        return '';
    }

    // Find the first message item and extract its text
    for (const item of response.output) {
        if (item?.type === 'message' && item.content) {
            for (const contentItem of item.content) {
                if (contentItem?.type === 'output_text') {
                    return contentItem.text || '';
                }
            }
        }
    }

    return '';
};

/**
 * Generate a unique session ID if not provided
 */
const getSessionId = (sessionId?: string): string => {
    return (
        sessionId ||
        `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    );
};

/**
 * Format a simple text prompt into the proper API format
 */
const formatTextInput = (text: string): string | object => {
    // For simple text inputs, you can use a string directly
    return text;

    // Alternatively, you can use the more explicit format:
    /*
  return {
    role: "user",
    content: [
      {
        type: "input_text",
        text: text
      }
    ]
  };
  */
};

/**
 * Build a default system preamble describing tool-calling behavior when Arcade toolkits are enabled.
 * This is prepended to any user-provided system prompt for tool-enabled flows.
 */
const buildToolsSystemPrompt = (
    toolkits: string[],
    userSystemPrompt?: string
) => {
    const toolkitList = toolkits.join(', ');
    const preamble = `You can call external tools via Arcade toolkits [${toolkitList}].
You will be given OpenAI-formatted function tools with strict JSON schemas. When a tool is needed:
- Select the correct tool and provide arguments matching the schema exactly (correct field names and types).
- Wait for tool results before answering; incorporate outputs into the final response.
- If authorization is required, it will be handled automatically; retry after auth completes.
- Do not fabricate tool outputs; execute the tool to retrieve real data or perform actions.
- Prefer safe, non-destructive actions unless explicitly requested.`;

    return userSystemPrompt ? `${preamble}\n\n${userSystemPrompt}` : preamble;
};

/**
 * Ask GPT a simple question and get a response
 *
 * @param prompt - Your question or instruction
 * @param systemPrompt - Instructions for how GPT should behave
 * @returns The generated text response
 */
export const ask = async (
    prompt: string,
    systemPrompt: string,
    toolkits?: string[]
): Promise<string> => {
    // Tool-enabled path
    if (toolkits && toolkits.length > 0) {
        const systemWithTools = buildToolsSystemPrompt(toolkits, systemPrompt);
        return await runWithTools(
            [
                { role: 'system', content: systemWithTools },
                { role: 'user', content: prompt },
            ],
            toolkits
        );
    }
    try {
        const result = await callProxy({
            service: 'openai',
            operation: 'chat_completion',
            payload: {
                model: MEDIUM_GPT_MODEL,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt },
                ],
            },
        });

        // The proxy wraps the response in { success: true, data: ... }
        // We need to unwrap it to access the OpenAI response
        const proxyResponse = result as ProxyResponse<ChatCompletionResponse>;
        const content =
            proxyResponse.data?.choices?.[0]?.message?.content || '';

        if (!content) {
            // No content in response
        }

        return content;
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`GPT request failed: ${errorMessage}`);
    }
};

/**
 * Have a conversation with GPT - using OpenAI's stateful conversation
 *
 * @param message - Your message
 * @param sessionId - Optional ID to continue a previous conversation
 * @param systemPrompt - Optional system prompt for this session (only used when starting a new session)
 * @returns The response text and session ID to continue the conversation
 */

export const chat = async (
    message: string,
    sessionId?: string,
    systemPrompt?: string,
    toolkits?: string[]
): Promise<{ text: string; sessionId: string }> => {
    const chatSessionId = getSessionId(sessionId);

    // Initialize session if it doesn't exist
    if (!chatSessions.has(chatSessionId)) {
        chatSessions.set(chatSessionId, { messages: [] });
    }

    const session = chatSessions.get(chatSessionId)!;

    // If tools requested, use tool-enabled chat flow
    if (toolkits && toolkits.length > 0) {
        const baseMessages: {
            role: 'user' | 'assistant' | 'system';
            content: string;
        }[] = [];
        if (session.messages.length === 0) {
            // Always include the tools preamble when starting a tool-enabled chat turn
            baseMessages.push({
                role: 'system',
                content: buildToolsSystemPrompt(toolkits, systemPrompt),
            });
        }
        // Include prior history
        for (const m of session.messages) {
            baseMessages.push({ role: m.role, content: m.content });
        }
        // Add current user message
        baseMessages.push({ role: 'user', content: message });

        const extractedText = await runWithTools(baseMessages, toolkits);

        // Persist to history after success
        session.messages.push({ role: 'user', content: message });
        session.messages.push({ role: 'assistant', content: extractedText });

        return { text: extractedText, sessionId: chatSessionId };
    }

    // Prepare request payload
    const requestPayload: {
        model: string;
        previous_response_id?: string;
        input?: string | MessageInput[];
    } = {
        model: MEDIUM_GPT_MODEL,
    };

    // Add previous response ID if we have one (continuation of conversation)
    if (session.lastResponseId) {
        requestPayload.previous_response_id = session.lastResponseId;
        requestPayload.input = message;
    } else {
        // First message in the conversation
        const messages: MessageInput[] = [];

        if (systemPrompt) {
            messages.push({
                role: 'system',
                content: [{ type: 'input_text', text: systemPrompt }],
            });
        }

        messages.push({
            role: 'user',
            content: [{ type: 'input_text', text: message }],
        });

        requestPayload.input = messages;
    }

    try {
        const result = await callProxy({
            service: 'openai',
            operation: 'responses_create',
            payload: requestPayload,
        });

        const proxyResponse = result as ProxyResponse<OpenAIResponse>;
        const response = proxyResponse.data;

        if (!response) {
            throw new Error('No data in proxy response');
        }

        handleError(response);

        // Store the response ID for continuation
        session.lastResponseId = response.id;

        // Extract the text and add to history
        const extractedText = extractText(response);
        session.messages.push({
            role: 'assistant',
            content: extractedText,
        });

        return {
            text: extractedText,
            sessionId: chatSessionId,
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`GPT chat request failed: ${errorMessage}`);
    }
};

/**
 * Clear a chat session's history
 */
export const clearChat = (sessionId: string): boolean => {
    return chatSessions.delete(sessionId);
};

/**
 * Get chat history for a session
 */
export const getChatHistory = (sessionId: string): ChatMessage[] | null => {
    return chatSessions.has(sessionId)
        ? [...chatSessions.get(sessionId)!.messages]
        : null;
};

/**
 * Analyze an image with GPT and return structured JSON
 *
 * @param imageBase64 - Base64 encoded image data
 * @param prompt - Your prompt about the image
 * @param schemaExample - Example of the JSON structure you want
 * @param systemPrompt - Instructions for how GPT should analyze the image
 * @returns The generated JSON analysis
 */

export const analyzeImage = async (
    imageBase64: string,
    prompt: string,
    schemaExample: string,
    systemPrompt: string
): Promise<object> => {
    // Create a prompt that includes schema requirements
    const finalPrompt =
        prompt +
        ` Please format your response according to this JSON schema: ${schemaExample}`;

    // Ensure the base64 string has the proper data URL prefix if not already present
    const formattedImageData = imageBase64.startsWith('data:image/')
        ? imageBase64
        : `data:image/jpeg;base64,${imageBase64}`;

    const requestPayload = {
        model: MEDIUM_GPT_MODEL,
        input: [
            {
                role: 'user',
                content: [
                    { type: 'input_text', text: finalPrompt },
                    { type: 'input_image', image_url: formattedImageData },
                ],
            },
        ],
        instructions: systemPrompt,
        text: {
            format: {
                type: 'json_object',
            },
        },
    };

    try {
        const result = await callProxy({
            service: 'openai',
            operation: 'responses_create',
            payload: requestPayload,
        });

        const proxyResponse = result as ProxyResponse<OpenAIResponse>;
        const response = proxyResponse.data;

        if (!response) {
            throw new Error('No data in proxy response');
        }

        handleError(response);

        // Find JSON in the response
        for (const item of response.output || []) {
            if (item?.type === 'message' && item.content) {
                for (const contentItem of item.content) {
                    if (contentItem?.type === 'output_text') {
                        try {
                            return JSON.parse(contentItem.text || '');
                        } catch {
                            throw new Error('Failed to parse JSON response');
                        }
                    }
                }
            }
        }

        throw new Error('No valid JSON found in response');
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`GPT image analysis request failed: ${errorMessage}`);
    }
};

/**
 * Generate structured JSON data from a prompt
 *
 * @param prompt - Your request
 * @param schemaExample - Example of the JSON structure you want
 * @param systemPrompt - Additional instructions for how GPT should generate the JSON
 * @returns The generated JSON data
 */

export const getJSON = async (
    prompt: string,
    schemaExample: string,
    systemPrompt: string,
    model: string = MEDIUM_GPT_MODEL
): Promise<object> => {
    const instructions = `
    ${systemPrompt}

    You must respond with a valid JSON object similar to this example structure:
    ${schemaExample}

    Your response must be only valid JSON, without any additional text.
  `;

    // Ensure the prompt contains the word "json" to meet API requirements
    const enhancedPrompt = prompt.toLowerCase().includes('json')
        ? prompt
        : `Please provide the following information as JSON: ${prompt}`;

    const requestPayload = {
        model: model,
        input: formatTextInput(enhancedPrompt),
        instructions: instructions,
        text: {
            format: {
                type: 'json_object',
            },
        },
    };

    try {
        const result = await callProxy({
            service: 'openai',
            operation: 'responses_create',
            payload: requestPayload,
        });

        const proxyResponse = result as ProxyResponse<OpenAIResponse>;
        const response = proxyResponse.data;

        if (!response) {
            throw new Error('No data in proxy response');
        }

        handleError(response);

        // Find JSON in the response
        for (const item of response.output || []) {
            if (item?.type === 'message' && item.content) {
                for (const contentItem of item.content) {
                    if (contentItem?.type === 'output_text') {
                        try {
                            return JSON.parse(contentItem.text || '');
                        } catch {
                            throw new Error('Failed to parse JSON response');
                        }
                    }
                }
            }
        }

        throw new Error('No valid JSON found in response');
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`GPT JSON generation request failed: ${errorMessage}`);
    }
};

/**
 * Search the web and get AI analysis formatted as JSON
 *
 * @param query - Search query
 * @param prompt - Optional additional instructions for analyzing results
 * @param systemPrompt - Optional system instructions
 * @param schemaExample - JSON schema example for output format
 * @returns JSON object formatted according to schema
 */
export const webSearch = async (
    query: string,
    schemaExample: string,
    prompt?: string,
    systemPrompt?: string
): Promise<object> => {
    // Step 1: Get web search results with AI analysis
    const searchPrompt = prompt
        ? `Search for: ${query}\n\nAdditional instructions: ${prompt}`
        : `Search for: ${query}`;

    const defaultSystemPrompt =
        systemPrompt ||
        'You are a helpful assistant that can search the web and provide accurate, up-to-date information based on search results.';

    const requestPayload = {
        model: MEDIUM_GPT_MODEL,
        input: formatTextInput(searchPrompt),
        instructions: defaultSystemPrompt,
        tools: [{ type: 'web_search_preview' }],
    };

    try {
        const result = await callProxy({
            service: 'openai',
            operation: 'responses_create',
            payload: requestPayload,
        });

        const proxyResponse = result as ProxyResponse<OpenAIResponse>;
        const response = proxyResponse.data;

        if (!response) {
            throw new Error('No data in proxy response');
        }

        handleError(response);

        // Step 2: Extract citations from the response
        const citations: Array<{
            title?: string;
            url?: string;
            start_index?: number;
            end_index?: number;
        }> = [];
        for (const item of response.output || []) {
            if (item?.type === 'message' && item.content) {
                for (const contentItem of item.content) {
                    if (
                        contentItem?.type === 'output_text' &&
                        contentItem.annotations
                    ) {
                        for (const annotation of contentItem.annotations) {
                            if (annotation.type === 'url_citation') {
                                citations.push({
                                    title: annotation.title,
                                    url: annotation.url,
                                    start_index: annotation.start_index,
                                    end_index: annotation.end_index,
                                });
                            }
                        }
                    }
                }
            }
        }

        // Step 3: Format citations into JSON using user's schema
        const formatPrompt = `Format these web search results according to the requested schema:

Search Results:
${citations
    .map((citation) => `- ${citation.title}: ${citation.url}`)
    .join('\n')}

Additional context from search: ${extractText(response)}`;

        const formatSystemPrompt = `You are formatting web search results into the requested JSON structure. Use the search results and any additional context to create accurate, structured data according to the schema provided.`;

        return await getJSON(formatPrompt, schemaExample, formatSystemPrompt);
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`GPT web search request failed: ${errorMessage}`);
    }
};

/**
 * Ask GPT with Arcade tools support
 *
 * @param prompt - Your question or instruction
 * @param systemPrompt - Instructions for how GPT should behave
 * @param toolkits - Optional array of Arcade toolkit names to use (e.g., ["gmail", "github"])
 * @returns The generated response with tool execution results
 */
const runWithTools = async (
    initialMessages: Array<{ role: string; content: string }>,
    toolkits?: string[]
): Promise<string> => {
    try {
        // Get tool definitions from Arcade in OpenAI format
        let tools: Array<{
            type: string;
            function: {
                name: string;
                description: string;
                parameters: Record<string, unknown>;
            };
        }> = [];

        if (toolkits && toolkits.length > 0) {
            for (const toolkit of toolkits) {
                try {
                    // Use proxy to get tools from Arcade
                    const proxyResult = await callProxy({
                        service: 'arcade',
                        operation: 'get_formatted_tools',
                        payload: {
                            format: 'openai',
                            toolkit: toolkit,
                        },
                    });

                    const toolDefsResponse = proxyResult as ProxyResponse<
                        Array<{
                            type: string;
                            function: {
                                name: string;
                                description: string;
                                parameters: Record<string, unknown>;
                            };
                        }>
                    >;

                    // The proxy returns the items array directly
                    if (
                        toolDefsResponse.data &&
                        toolDefsResponse.data.length > 0
                    ) {
                        const toolItems = toolDefsResponse.data;
                        tools = tools.concat(toolItems);
                    }
                } catch {
                    // Silently continue if toolkit fails to load
                }
            }
        }

        // Make initial OpenAI call with tools

        const result = await callProxy({
            service: 'openai',
            operation: 'chat_completion',
            payload: {
                model: DEFAULT_GPT_MODEL,
                messages: initialMessages,
                tools: tools.length > 0 ? tools : undefined,
                tool_choice: tools.length > 0 ? 'required' : undefined,
            },
        });

        // Handle as ProxyResponse<ChatCompletionResponse>
        const proxyResponse = result as ProxyResponse<ChatCompletionResponse>;
        const message = proxyResponse.data?.choices?.[0]?.message;

        // Type for message with tool calls
        type MessageWithToolCalls = {
            role: string;
            content: string;
            tool_calls?: Array<{
                id: string;
                type: string;
                function: {
                    name: string;
                    arguments: string;
                };
            }>;
        };

        const messageWithTools = message as MessageWithToolCalls;

        if (!message) {
            throw new Error('No message in response');
        }

        // Check if the model wants to use tools
        const toolCalls = messageWithTools?.tool_calls;

        if (toolCalls && toolCalls.length > 0) {
            const messages = [
                ...initialMessages,
                message, // Add the assistant's message with tool calls
            ];

            // Process each tool call
            for (const toolCall of toolCalls) {
                try {
                    // Execute the tool via Arcade
                    // Convert underscore format (Math_Sqrt) to dot format (Math.Sqrt)
                    const toolName = toolCall.function.name.replace('_', '.');
                    const toolInput = JSON.parse(toolCall.function.arguments);
                    const toolExecResult = await callProxy({
                        service: 'arcade',
                        operation: 'execute_tool',
                        payload: {
                            tool_name: toolName,
                            input: toolInput,
                        },
                    });

                    // Check if the result indicates an auth error
                    const proxyResult = toolExecResult as ProxyResponse<{
                        output?: unknown;
                        type?: string;
                    }>;
                    if (
                        !proxyResult.success &&
                        proxyResult.data?.type === 'auth_required'
                    ) {
                        // Handle auth requirement - this will be processed in the catch block
                        throw new Error('AUTH_REQUIRED');
                    }

                    const toolResult = (
                        toolExecResult as ProxyResponse<{ output: unknown }>
                    ).data;

                    // Add tool result to messages
                    const toolResultContent = JSON.stringify(
                        toolResult?.output || {}
                    );
                    messages.push({
                        role: 'tool',
                        content: toolResultContent,
                        tool_call_id: toolCall.id,
                    } as never);
                } catch (toolError) {
                    // Check if authorization is required
                    const errorMessage =
                        toolError instanceof Error
                            ? toolError.message
                            : String(toolError);
                    const authRequired = errorMessage === 'AUTH_REQUIRED';

                    if (authRequired) {
                        // Get authorization URL
                        // Convert underscore format (Gmail_SendEmail) to dot format (Gmail.SendEmail)
                        const toolName = toolCall.function.name.replace(
                            '_',
                            '.'
                        );

                        const authProxyResult = await callProxy({
                            service: 'arcade',
                            operation: 'authorize_tool',
                            payload: {
                                tool_name: toolName,
                            },
                        });

                        const authResponse = (
                            authProxyResult as ProxyResponse<{
                                status: string;
                                url?: string;
                                id: string;
                            }>
                        ).data;

                        // Check if authorization is already completed
                        if (authResponse?.status === 'completed') {
                            try {
                                // If auth is completed, retry the tool execution
                                const retryProxyResult = await callProxy({
                                    service: 'arcade',
                                    operation: 'execute_tool',
                                    payload: {
                                        tool_name: toolName,
                                        input: JSON.parse(
                                            toolCall.function.arguments
                                        ),
                                    },
                                });

                                const retryResult = (
                                    retryProxyResult as ProxyResponse<{
                                        output: unknown;
                                    }>
                                ).data;

                                messages.push({
                                    role: 'tool',
                                    content: JSON.stringify(
                                        retryResult?.output || {}
                                    ),
                                    tool_call_id: toolCall.id,
                                } as never);
                            } catch (retryError) {
                                const errorMessage =
                                    retryError instanceof Error
                                        ? retryError.message
                                        : String(retryError);
                                messages.push({
                                    role: 'tool',
                                    content: JSON.stringify({
                                        error: errorMessage,
                                    }),
                                    tool_call_id: toolCall.id,
                                } as never);
                            }
                        } else {
                            // Authorization not completed - open URL and poll for completion
                            // Open the auth URL directly since we're in the frontend
                            if (
                                authResponse?.url &&
                                typeof window !== 'undefined'
                            ) {
                                window.open(authResponse.url, '_blank');
                            }

                            // Poll for auth completion

                            const completionResult = await callProxy({
                                service: 'arcade',
                                operation: 'wait_for_auth_completion',
                                payload: {
                                    auth_id: authResponse?.id,
                                },
                            });

                            const completionResponse = (
                                completionResult as ProxyResponse<{
                                    status: string;
                                }>
                            ).data;

                            if (completionResponse?.status !== 'completed') {
                                messages.push({
                                    role: 'tool',
                                    content: JSON.stringify({
                                        error: 'Authorization was not completed',
                                    }),
                                    tool_call_id: toolCall.id,
                                } as never);
                                continue; // Skip to next tool call
                            }

                            try {
                                // Retry the tool execution now that auth is complete
                                const retryProxyResult = await callProxy({
                                    service: 'arcade',
                                    operation: 'execute_tool',
                                    payload: {
                                        tool_name: toolName,
                                        input: JSON.parse(
                                            toolCall.function.arguments
                                        ),
                                    },
                                });

                                const retryResult = (
                                    retryProxyResult as ProxyResponse<{
                                        output: unknown;
                                    }>
                                ).data;

                                messages.push({
                                    role: 'tool',
                                    content: JSON.stringify(
                                        retryResult?.output || {}
                                    ),
                                    tool_call_id: toolCall.id,
                                } as never);
                            } catch (retryError) {
                                const errorMessage =
                                    retryError instanceof Error
                                        ? retryError.message
                                        : String(retryError);
                                messages.push({
                                    role: 'tool',
                                    content: JSON.stringify({
                                        error: errorMessage,
                                    }),
                                    tool_call_id: toolCall.id,
                                } as never);
                            }
                        }
                    } else {
                        // Add error as tool result
                        const errorMessage =
                            toolError instanceof Error
                                ? toolError.message
                                : String(toolError);
                        messages.push({
                            role: 'tool',
                            content: JSON.stringify({ error: errorMessage }),
                            tool_call_id: toolCall.id,
                        } as never);
                    }
                }
            }

            // Get final response from OpenAI with tool results

            const finalResult = await callProxy({
                service: 'openai',
                operation: 'chat_completion',
                payload: {
                    model: DEFAULT_GPT_MODEL,
                    messages,
                },
            });

            // Handle final response as ChatCompletionResponse
            const finalProxyResponse =
                finalResult as ProxyResponse<ChatCompletionResponse>;
            const finalMessage =
                finalProxyResponse.data?.choices?.[0]?.message?.content || '';

            return finalMessage;
        }

        // No tool calls, return regular response
        const regularContent = message.content || '';
        return regularContent;
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`GPT tool-enabled request failed: ${errorMessage}`);
    }
};

/**
 * Main export with all the functions
 */
export const gpt = {
    ask,
    chat,
    analyzeImage,
    getJSON,
    webSearch,
    clearChat,
    getChatHistory,
};
