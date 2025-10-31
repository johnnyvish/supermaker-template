/**
 * Generated documentation for gpt module.
 * This file is auto-generated from module_types/gpt.ts
 */

export const gpt = {
  moduleName: "gpt",
  description:
    "GPT API for AI-powered features. Provides text generation, image analysis, web search, and detailed tool calling via Arcade. Maintains chat sessions for contextual conversations. Supports 15+ external service integrations through Arcade toolkits. See tool-calling details in ask/chat docs below.",
  userDescription:
    "Integrate AI capabilities for text generation, image analysis, and conversational interactions powered by advanced language models.",

  functions: {
    ask: {
      name: "ask",
      description: "Asks single question to AI.",
      documentation: `
Signature: (prompt: string, systemPrompt: string, toolkits?: string[]) => Promise<string>

Parameters
- prompt: User prompt
- systemPrompt: System instructions
- toolkits: Optional array of Arcade toolkit names (e.g., ["gmail", "github"]) to enable tool calling

Tool Calling (ask)
- Enabling tools: Passing a non-empty \'toolkits\' array enables tool calling for this ask.
- Discovery: For each toolkit, we fetch OpenAI-formatted tool specs from Arcade (via a backend proxy calling \'arcade.get_formatted_tools\').
- Selection: We send those tool specs to OpenAI Chat Completions with \'tool_choice: "required"\'. The model decides which tool(s) to call and with which arguments.
- Naming: OpenAI receives function names like \'Gmail_SendEmail\'. Before execution we convert underscores to dot form (\'Gmail.SendEmail\') when calling Arcade.
- Execution: Each tool call is executed via the backend proxy \'arcade.execute_tool\' with the parsed JSON arguments. The tool\'s raw output is added back to the conversation as a tool message.
- Authorization: If Arcade returns \'auth_required\', we request authorization via \'arcade.authorize_tool\', open the returned URL for the user, wait for completion (\'arcade.wait_for_auth_completion\'), then retry the tool.
- Finalization: After executing all requested tools, we make a follow-up model call including the tool results to produce the final answer.

Input/Output
- Input arguments to tools follow the JSON schema that Arcade returns in the tool definition.
- Tool outputs are JSON; they are provided to the model as tool messages and summarized in the final response.

Errors and Retries
- Tool failures are captured and added as JSON { error } tool messages; the model can decide how to proceed.
- Authorization flows are retried automatically after successful auth.

Examples
// Ask with Google tools
await Native.gpt.ask(
  "Send an email to team@company.com about tomorrow's standup",
  "You are a helpful assistant",
  ["google"]
);

// Ask across multiple toolkits
await Native.gpt.ask(
  "Create a Jira ticket and a Linear issue for the payment bug",
  "You are a project manager assistant",
  ["atlassian", "linear"]
);

Available Arcade Integrations
- arcade-asana
- arcade-atlassian
- arcade-clickup
- arcade-discord
- arcade-github
- arcade-google
- arcade-hubspot
- arcade-linear
- arcade-linkedin
- arcade-microsoft
- arcade-notion
- arcade-reddit
- arcade-slack
- arcade-x
- arcade-zoom
`,
    },

    chat: {
      name: "chat",
      description: "Continues chat conversation (tools optional).",
      documentation: `
Signature: (message: string, sessionId?: string, systemPrompt?: string, toolkits?: string[]) => Promise<ChatResponse>

Parameters
- message: User message
- sessionId: Session for context. If omitted, a new chat session is created; subsequent calls can reuse the returned sessionId.
- systemPrompt: System instructions for assistant behavior
- toolkits: Optional array of Arcade toolkit names to enable tool calling during this chat turn

Tool Calling (chat)
- Sessions: The chat function preserves history per sessionId. Tool results from earlier turns remain in context for later turns.
- Enabling tools: Passing toolkits for a chat turn enables tool calls for that turn. You can vary toolkits between turns.
- Discovery/Selection/Execution: Same flow as ask — Arcade provides OpenAI-formatted tools, the model returns tool_calls, we execute via Arcade, handle auth if needed, and then send a finalizing model call.
- Naming: Function names from the model (e.g., \'GitHub_ListPullRequests\') are converted to dot form (\'GitHub.ListPullRequests\') before Arcade execution.
- Authorization: On \'auth_required\', we initiate authorization and block until completion, then retry the tool automatically.

Input/Output
- Tool inputs: Must conform to the tool\'s JSON schema returned by Arcade.
- Tool outputs: JSON objects added as tool messages; the assistant\'s final message summarizes these results.

Errors
- Errors are surfaced as tool messages with an { error } payload; the assistant will attempt to handle gracefully.

Examples
// Start chat with GitHub tools
const chat1 = await Native.gpt.chat(
  "What open pull requests do I have?",
  undefined,
  "You are a helpful development assistant",
  ["github"]
);

// Continue chat, toolkits can change per turn
const chat2 = await Native.gpt.chat(
  "Create issues for any pending bug reports",
  chat1.sessionId,
  "You are a helpful development assistant",
  ["github", "linear"]
);

Available Arcade Integrations
- arcade-asana
- arcade-atlassian
- arcade-clickup
- arcade-discord
- arcade-github
- arcade-google
- arcade-hubspot
- arcade-linear
- arcade-linkedin
- arcade-microsoft
- arcade-notion
- arcade-reddit
- arcade-slack
- arcade-x
- arcade-zoom
`,
    },

    analyzeImage: {
      name: "analyzeImage",
      description: "Analyzes image with AI.",
      documentation: `
Signature: (imageBase64: string, prompt: string, schemaExample: string, systemPrompt: string) => Promise<object>
Param Info:
  - imageBase64: Base64 image data
  - prompt: Analysis prompt
  - schemaExample: Expected JSON structure
  - systemPrompt: System instructions
`,
    },

    getJSON: {
      name: "getJSON",
      description: "Gets structured JSON response.",
      documentation: `
Signature: (prompt: string, schemaExample: string, systemPrompt: string) => Promise<object>
Param Info:
  - prompt: User prompt
  - schemaExample: Expected JSON structure
  - systemPrompt: System instructions
`,
    },

    webSearch: {
      name: "webSearch",
      description: "Searches web and returns structured data.",
      documentation: `
Signature: (query: string, schemaExample: string, prompt?: string, systemPrompt?: string) => Promise<object>
Param Info:
  - query: Search query
  - schemaExample: Expected JSON structure
  - prompt: Processing instructions
  - systemPrompt: System instructions
`,
    },

    clearChat: {
      name: "clearChat",
      description: "Clears chat session.",
      documentation: `
Signature: (sessionId: string) => boolean
`,
    },

    getChatHistory: {
      name: "getChatHistory",
      description: "Gets chat history for session.",
      documentation: `
Signature: (sessionId: string) => ChatMessage[] | null
`,
    },
  },

  types: {
    ChatResponse: {
      type: "interface",
      description: "",
      properties: {
        text: "AI response text",
        sessionId: "Session ID for continuity",
      },
    },
    ChatMessage: {
      type: "interface",
      description: "Chat message history",
      properties: {
        role: "Message sender role - can be user, assistant, or system",
        content: "Message content",
      },
    },
  },

  example: `
// Simple text generation
const response = await Native.gpt.ask("What is React?", "Be concise");

// Conversational chat with context
const {text, sessionId} = await Native.gpt.chat("Tell me more");

// Send email with Google toolkit (tools via ask)
const result = await Native.gpt.ask(
  "Send an email to team@company.com about tomorrow's standup",
  "You are a helpful assistant",
  ["google"]
);

// Create tasks across multiple platforms (tools via ask)
const result2 = await Native.gpt.ask(
  "Create a Jira ticket and a Linear issue for the payment bug",
  "You are a project manager assistant",
  ["atlassian", "linear"]
);

// Chat with tools - start new session
const chat1 = await Native.gpt.chat(
  "Check my GitHub notifications",
  undefined,
  "You are a helpful developer assistant",
  ["github"]
);

// Continue chat session with tools
const chat2 = await Native.gpt.chat(
  "Create issues for any bug reports",
  chat1.sessionId,
  "You are a helpful developer assistant",
  ["github"]
);
`,
};

// Export for module access
export default gpt;
