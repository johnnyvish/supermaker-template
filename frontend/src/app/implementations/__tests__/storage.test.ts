import { describe, it, expect } from 'vitest';
import { storage } from '../storage';

describe('storage implementation', () => {
    it('setItem/getItem/removeItem roundtrip', async () => {
        await storage.setItem('foo', 'bar');
        const val = await storage.getItem('foo');
        expect(val).toBe('bar');

        const all = await storage.getAllItems();
        expect(all.foo).toBe('bar');

        const removed = await storage.removeItem('foo');
        expect(removed).toBe(true);
        const after = await storage.getItem('foo');
        expect(after).toBeNull();
    });

    it('setImageItem/getImageItem/removeImageItem and list metadata', async () => {
        const dataUrl = 'data:image/png;base64,AAA';
        const ok = await storage.setImageItem('img1', dataUrl);
        expect(ok).toBe(true);

        const got = await storage.getImageItem('img1');
        expect(got).toBe(dataUrl);

        const allImgs = await storage.getAllImageItems();
        expect(allImgs.img1).toBeDefined();
        expect(allImgs.img1.mimeType).toBe('image/png');
        expect(allImgs.img1.filePath).toBe(dataUrl);

        const removed = await storage.removeImageItem('img1');
        expect(removed).toBe(true);
    });
});
