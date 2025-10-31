import { describe, it, expect, vi } from 'vitest';
import { accelerometer } from '../accelerometer';

describe('accelerometer implementation', () => {
    it('start and stop toggle running state', async () => {
        vi.useFakeTimers();

        const started = await accelerometer.start(10);
        expect(started).toBe(true);
        expect(await accelerometer.isRunning()).toBe(true);

        // allow some intervals to elapse
        vi.advanceTimersByTime(50);

        const reading = await accelerometer.getCurrentReading();
        expect(reading).toHaveProperty('x');
        expect(reading).toHaveProperty('y');
        expect(reading).toHaveProperty('z');

        const stopped = await accelerometer.stop();
        expect(stopped).toBe(true);
        expect(await accelerometer.isRunning()).toBe(false);

        vi.useRealTimers();
    });
});
