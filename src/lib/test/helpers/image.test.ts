import {
  generateCloudinaryUrl,
  resizeWithAspectRatio,
  selectBestHeight,
  selectBestWidth,
  transformToString
} from '$lib/helpers/image';
import {  describe, expect, it, vi } from 'vitest';
// Mock the env module
vi.mock('$env/static/public', () => ({
  PUBLIC_CLOUDINARY_CNAME: 'test-cloudinary.com',
  PUBLIC_CLOUDINARY_UPLOAD_PRESET: 'test_preset'
}));

describe('Test helper: Image', () => {
  describe('Test transformToString', () => {
    it('cleans transform param', () => {
      expect(
        transformToString({
          width: 200,
          w: 20,
          height: 100,
          h: 10,
          gravity: 'face',
          g: 'auto',
          crop: 'auto',
          c: 'scale',
          aspect_ratio: '16:9',
          ar: '9:16',
          angle: 80,
          a: 8,
          y: 10,
          round: 'max',
          r: 2
        })
      ).toBe(`f_auto,q_auto,w_20,h_10,g_auto,c_scale,a_8,ar_9:16,r_2`);

      expect(
        transformToString({
          w: 20,
          h: 10,
          g: 'auto',
          c: 'scale',
          ar: '9:16',
          a: 8,
          y: 10,
          r: 2
        })
      ).toBe(`f_auto,q_auto,w_20,h_10,g_auto,c_scale,a_8,ar_9:16,r_2`);

      expect(
        transformToString({
          width: 200,
          height: 100,
          gravity: 'face',
          crop: 'auto',
          aspect_ratio: '16:9',
          angle: 80,
          y: 10,
          round: 'max'
        })
      ).toBe(`f_auto,q_auto,w_200,h_100,g_face,c_auto,a_80,ar_16:9,r_max`);
    });

    it('prefix string', () => {
      expect(
        transformToString(undefined, {
          prefixText: 'prefix'
        })
      ).toBe('prefixf_auto,q_auto');
    });

    it('suffix string', () => {
      expect(
        transformToString(undefined, {
          suffixText: 'suffix'
        })
      ).toBe('f_auto,q_autosuffix');
    });

    it('prefix and suffix string', () => {
      expect(
        transformToString(undefined, {
          prefixText: 'prefix',
          suffixText: 'suffix'
        })
      ).toBe('prefixf_auto,q_autosuffix');
    });
  });

  it('Test selectBestWidth', () => {
    expect(selectBestWidth(0)).toBe(80);
    expect(selectBestWidth(50)).toBe(80);
    expect(selectBestWidth(100)).toBe(120);
    expect(selectBestWidth(200)).toBe(240);
    expect(selectBestWidth(300)).toBe(320);
    expect(selectBestWidth(400)).toBe(480);
    expect(selectBestWidth(500)).toBe(640);
    expect(selectBestWidth(660)).toBe(720);
    expect(selectBestWidth(730)).toBe(960);
    expect(selectBestWidth(1000)).toBe(1280);
    expect(selectBestWidth(1400)).toBe(1640);
    expect(selectBestWidth(1800)).toBe(1920);
    expect(selectBestWidth(2000)).toBe(2560);
    expect(selectBestWidth(3000)).toBe(3840);
    expect(selectBestWidth(4000)).toBe(3840);
  });

  it('Test selectBestHeight', () => {
    //60, 90, 180, 240, 320, 480, 600, 720, 900, 1080, 1440, 2160
    expect(selectBestHeight(0)).toBe(60);
    expect(selectBestHeight(50)).toBe(60);
    expect(selectBestHeight(70)).toBe(90);
    expect(selectBestHeight(100)).toBe(180);
    expect(selectBestHeight(200)).toBe(240);
    expect(selectBestHeight(300)).toBe(320);
    expect(selectBestHeight(400)).toBe(480);
    expect(selectBestHeight(500)).toBe(600);
    expect(selectBestHeight(700)).toBe(720);
    expect(selectBestHeight(800)).toBe(900);
    expect(selectBestHeight(1000)).toBe(1080);
    expect(selectBestHeight(1400)).toBe(1440);
    expect(selectBestHeight(2000)).toBe(2160);
    expect(selectBestHeight(3000)).toBe(2160);
  });

  describe('Test resizeWithAspectRatio', () => {
    it('reduce image to the right format', () => {
      expect(
        resizeWithAspectRatio({
          original: {
            width: 1280,
            height: 1920
          },
          targetWidth: 720
        })
      ).toStrictEqual({
        width: 720,
        height: 1080
      });
    });

    it('upscale image to the right format', () => {
      expect(
        resizeWithAspectRatio({
          original: {
            width: 1280,
            height: 720
          },
          targetWidth: 1920
        })
      ).toStrictEqual({
        width: 1920,
        height: 1080
      });
    });
  });

  describe('Test generateCloudinaryUrl', () => {
    it('returns default image', () => {
      expect(generateCloudinaryUrl({})).toBe(
        `https://test-cloudinary.com/image/upload/f_auto,q_auto/default`
      );
    });

    it('fails to return image with preset', () => {
      expect(generateCloudinaryUrl({usePreset: true})).toBe(
        `https://test-cloudinary.com/image/upload/f_auto,q_auto/default`
      );
    });

    it('returns image without preset', () => {
      expect(generateCloudinaryUrl({src: 'sjkdfsjdhfb'})).toBe(
        `https://test-cloudinary.com/image/upload/f_auto,q_auto/sjkdfsjdhfb`
      );
    });

    it('returns image with preset and src', () => {
      expect(generateCloudinaryUrl({usePreset: true, src:'dev_test'})).toBe(
        `https://test-cloudinary.com/image/upload/f_auto,q_auto/test_preset/dev_test`
      );
      expect(generateCloudinaryUrl({usePreset: true, src:'/destination/dev_test'})).toBe(
        `https://test-cloudinary.com/image/upload/f_auto,q_auto/test_preset/destination/dev_test`
      );
    });

    it("returns image with transformation", () => {
      expect(generateCloudinaryUrl({usePreset: true, src:'/destination/dev_test',transform:{
        w:500,
        c: 'fill'
      }})).toBe(
        `https://test-cloudinary.com/image/upload/f_auto,q_auto,w_500,c_fill/test_preset/destination/dev_test`
      );
    })
  });
});
