import { describe, it, expect } from 'vitest';
import {
    ask,
    chat,
    clearChat,
    getChatHistory,
    getJSON,
    analyzeImage,
} from '../gpt';

describe('gpt implementation', () => {
    it('ask returns model echo of the prompt content', async () => {
        const res = await ask('Hello world', 'system');
        expect(res).toBe('Hello world');
    });

    it('chat maintains per-session history and returns text + sessionId', async () => {
        const first = await chat('Hi there');
        expect(first.text).toBeTypeOf('string');
        expect(first.text.length).toBeGreaterThan(0);
        expect(first.sessionId).toBeTypeOf('string');

        const beforeHistory = getChatHistory(first.sessionId);
        expect(beforeHistory?.length ?? 0).toBeGreaterThanOrEqual(1);

        const second = await chat('Second message', first.sessionId);
        expect(second.sessionId).toBe(first.sessionId);

        const afterHistory = getChatHistory(first.sessionId);
        expect(afterHistory?.length ?? 0).toBeGreaterThan(
            beforeHistory?.length ?? 0
        );
    });

    it('clearChat removes a session and history is null afterwards', async () => {
        const s = await chat('temp');
        const cleared = clearChat(s.sessionId);
        expect(cleared).toBe(true);
        expect(getChatHistory(s.sessionId)).toBeNull();
    });

    it('getJSON throws when proxy returns non-JSON output', async () => {
        await expect(
            getJSON('Return JSON please', '{"a":1}', 'system')
        ).rejects.toThrow('Failed to parse JSON response');
    });

    it('analyzeImage throws when proxy returns non-JSON output', async () => {
        await expect(
            analyzeImage(
                'data:image/png;base64,AAA',
                'analyze',
                '{"shape":"example"}',
                'system'
            )
        ).rejects.toThrow('Failed to parse JSON response');
    });
});
