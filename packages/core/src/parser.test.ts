import { describe, it, expect } from 'vitest';
import { GallantParser } from './parser';

describe('GallantParser', () => {
    it('should correctly convert the speed and power packet (18 bytes)', () => {
        const buffer = new ArrayBuffer(18);
        const view = new DataView(buffer);

        view.setUint16(2, 100, true);
        view.setInt16(9, 200, true);

        const result = GallantParser.parse(view);

        expect(result.speed).toBe(16.8);
        expect(result.power).toBe(166);
    });

    it('should correctly convert the cadence packet (6 bytes)', () => {
        const buffer = new ArrayBuffer(6);
        const view = new DataView(buffer);

        view.setUint16(2, 427, true);

        const result = GallantParser.parse(view);

        expect(result.cadence).toBe(10);
    });
});
