import { describe, it, expect } from 'vitest';
import { accelerometer } from '../accelerometer';
import { audio } from '../audio';
import { barometer } from '../barometer';
import { calendar } from '../calendar';
import { clipboard } from '../clipboard';
import { contacts } from '../contacts';
import { device } from '../device';
import { devicemotion } from '../devicemotion';
import { fileSystem } from '../fileSystem';
import { gpt } from '../gpt';
import { gyroscope } from '../gyroscope';
import { haptics } from '../haptics';
import { imageGeneration } from '../imageGeneration';
import { imageManipulator } from '../imageManipulator';
import { imagepicker } from '../imagepicker';
import { localauth } from '../localauth';
import { location } from '../location';
import { magnetometer } from '../magnetometer';
import { microsoftDocs } from '../microsoftDocs';
import { notifications } from '../notifications';
import { pedometer } from '../pedometer';
import { print } from '../print';
import { sharing } from '../sharing';
import { speech } from '../speech';
import { speechToText } from '../speechToText';
import { storage } from '../storage';

const entries: Array<[string, unknown]> = [
    ['accelerometer', accelerometer],
    ['audio', audio],
    ['barometer', barometer],
    ['calendar', calendar],
    ['clipboard', clipboard],
    ['contacts', contacts],
    ['device', device],
    ['devicemotion', devicemotion],
    ['fileSystem', fileSystem],
    ['gpt', gpt],
    ['gyroscope', gyroscope],
    ['haptics', haptics],
    ['imageGeneration', imageGeneration],
    ['imageManipulator', imageManipulator],
    ['imagepicker', imagepicker],
    ['localauth', localauth],
    ['location', location],
    ['magnetometer', magnetometer],
    ['microsoftDocs', microsoftDocs],
    ['notifications', notifications],
    ['pedometer', pedometer],
    ['print', print],
    ['sharing', sharing],
    ['speech', speech],
    ['speechToText', speechToText],
    ['storage', storage],
];

describe('implementations smoke', () => {
    for (const [name, mod] of entries) {
        it(`${name} exports an object with at least one function`, () => {
            expect(mod).toBeDefined();
            expect(typeof mod).toBe('object');
            const hasFunction = Object.values(
                mod as Record<string, unknown>
            ).some((v) => typeof v === 'function');
            expect(hasFunction).toBe(true);
        });
    }
});
