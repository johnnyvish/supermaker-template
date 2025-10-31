import { describe, it, expect, beforeAll } from 'vitest';
import { device } from '../device';

beforeAll(() => {
    // Default is set in test/setup.ts; ensure canvas exists for uniqueId path
    // @ts-ignore
    if (!HTMLCanvasElement.prototype.toDataURL) {
        Object.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', {
            value: () => 'data:image/png;base64,stub',
            configurable: true,
        });
    }
});

describe('device implementation', () => {
    it('getDeviceType classifies desktop UA as DESKTOP', async () => {
        const t = await device.getDeviceType();
        expect(t).toBe('DESKTOP');
    });

    it('getDeviceInfo includes OS info for macOS UA', async () => {
        const info = await device.getDeviceInfo();
        expect(info.osName).toBe('macOS');
        expect(info.osVersion).toMatch(/\d+\.\d+\.\d+|unknown/);
        expect(typeof info.isPhysicalDevice).toBe('boolean');
    });

    it('getMemoryInfo returns numeric totals', async () => {
        const mem = await device.getMemoryInfo();
        expect(mem.totalMemory).toBeGreaterThan(0);
        expect(mem.availableMemory).toBeGreaterThan(0);
    });

    it('getUniqueId is stable across calls', async () => {
        const id1 = await device.getUniqueId();
        const id2 = await device.getUniqueId();
        expect(id1).toBe(id2);
    });
});
