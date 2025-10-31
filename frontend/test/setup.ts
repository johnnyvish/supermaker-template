// Vitest setup for DOM-dependent modules
// Stub canvas to avoid errors in environments without full canvas support
Object.defineProperty(
    globalThis.HTMLCanvasElement?.prototype ?? {},
    'toDataURL',
    {
        value: () => 'data:image/png;base64,stub',
        configurable: true,
    }
);

// Provide a stable default userAgent and platform for device tests
const setNavigatorProp = (prop: string, value: unknown) => {
    try {
        // @ts-ignore - navigator is writable under test
        Object.defineProperty(globalThis.navigator, prop, {
            value,
            configurable: true,
        });
    } catch {
        // ignore
    }
};

setNavigatorProp(
    'userAgent',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
);
setNavigatorProp('platform', 'MacIntel');
