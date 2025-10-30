import { transformToString } from '$lib/helpers/image';
import { beforeEach, describe, expect, it } from 'vitest';

describe('Test helper: Image', () => {
    it('Test transformToString', () => {
        expect(transformToString({
            width: 200,
            w: 20,
            height: 100,
            h: 10,
            gravity: "face",
            g: "auto",
            crop: "auto",
            c: "scale",
            aspect_ratio: "16:9",
            ar: "9:16",
            angle: 80,
            a: 8,
            y: 10,
            round: "max",
            r: 2,
        })).toBe(
            `f_auto,q_auto,w_20,h_10,g_auto,c_scale,a_8,ar_9:16,r_2`
        )
    });
});