import { dev } from '$app/environment';
import { env } from '$env/dynamic/public';
import type { ImageDimensions, Transform, TransformKeys } from '$types';
import { isOfflineMode } from '.';

export const defaultWidth: number = 1280;
export const defaultHeight: number = 720;
export const defaultWidths: number[] = [
  80, 120, 240, 320, 480, 640, 720, 960, 1280, 1640, 1920, 2560, 3840
];
export const defaultHeights: number[] = [
  60, 90, 180, 240, 320, 480, 600, 720, 900, 1080, 1440, 2160
];

export const transformToString = (
  transform?: Transform,
  options?: { prefixText?: string; suffixText?: string }
) => {
  const parameters: string[] = [];
  const { prefixText, suffixText } = { prefixText: '', suffixText: '', ...options };

  if (transform) {
    const transformClean = clearDuplicatesInTransform(transform);

    for (const key in transformClean) {
      // keys are same as the cloudinary documentation, requires to use `clearDuplicatesInTransform` before
      parameters.push(`${key}_${transformClean[key as TransformKeys]}`);
    }
  }

  return `${prefixText}f_auto,q_auto${parameters.length ? ',' : ''}${parameters.join(',')}${suffixText}`;
};

/**
 * Returns a new transform with keys compatible with cloudinary and delete undefined entries
 */
const clearDuplicatesInTransform = (transform?: Transform) => {
  if (!transform) return;

  const result = {
    w: transform.w ?? transform.width,
    h: transform.h ?? transform.height,
    g: transform.g ?? transform.gravity,
    c: transform.c ?? transform.crop,
    a: transform.a ?? transform.angle,
    ar: transform.ar ?? transform.aspect_ratio,
    r: transform.r ?? transform.round
  };

  return Object.fromEntries(
    Object.entries(result).filter(([, value]) => value !== undefined)
  ) as Transform;
};

export const selectBestWidth = (width: number) => {
  return (
    defaultWidths.find((resolution) => width <= resolution) ??
    (width > defaultWidths[defaultWidths.length - 1]
      ? defaultWidths[defaultWidths.length - 1]
      : defaultWidth)
  );
};

export const selectBestHeight = (height: number) => {
  return (
    defaultHeights.find((resolution) => height <= resolution) ??
    (height > defaultWidths[defaultHeights.length - 1]
      ? defaultHeights[defaultHeights.length - 1]
      : defaultHeight)
  );
};

export const resizeWithAspectRatio = ({
  original,
  targetWidth
}: {
  original: ImageDimensions;
  targetWidth: number;
}): ImageDimensions => {
  const aspectRatio = original.width / original.height;
  const newHeight = Math.round(targetWidth / aspectRatio);

  return {
    width: targetWidth,
    height: newHeight
  };
};

export const generateCloudinaryUrl = ({
  src,
  usePreset,
  transform
}: {
  src?: string;
  usePreset?: boolean;
  transform?: Transform;
}) => {
  if (dev && isOfflineMode) {
    return '/pages/themes/cathedrale_skate.jpg';
  }
  const baseUrl = `https://${env.PUBLIC_CLOUDINARY_CNAME}/image/upload/`;
  if (!src) return `${baseUrl}${transformToString(transform)}/default`;
  let url = src;
  if (usePreset) {
    url = `${env.PUBLIC_CLOUDINARY_UPLOAD_PRESET}/${url.replace(/^\//, '')}`;
  }

  return `${baseUrl}${transformToString(clearDuplicatesInTransform(transform), { suffixText: '/' })}${url}`;
};
