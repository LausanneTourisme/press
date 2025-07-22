import { PUBLIC_CLOUDINARY_CNAME, PUBLIC_CLOUDINARY_UPLOAD_PRESET } from "$env/static/public";
import type { CloudinarySize, ImageDimensions, Transform } from "$types";

export const defaultWidth: number = 1280;
export const defaultHeight: number = 720;
export const defaultWidths: number[] = [
    80, 120, 240, 320, 480, 640, 720, 960, 1280, 1640, 1920, 2560, 3840
];
export const defaultHeights: number[] = [
    60, 90, 180, 240, 320, 480, 600, 720, 900, 1080, 1440, 2160
];

export const transformToString = (transform: Transform, options: { prefixText?: string, suffixText?: string }) => {
    const parameters: string[] = [];
    const { prefixText, suffixText } = { prefixText: '', suffixText: '', ...options };
    let resolution: number | undefined;
    const transformClean = clearDuplicatesInTransform(transform)

    for (const key in transformClean) {
        // Gravity & Crop first
        switch (key) {
            case "width":
            case "w":
                resolution = selectBestWidth(<number>transformClean[key]);
                parameters.push(`w_${resolution}`);
                break;

            case "height":
            case "h":
                resolution = transformClean.w ? transformClean[key] : selectBestHeight(<number>transformClean[key]);
                parameters.push(`h_${resolution}`);
                break;

            default:
                // @ts-ignore keys are same as the cloudinary documentation, requires to use `clearDuplicatesInTransform` before
                parameters.push(`${key}_${transformClean[key]}`)
                break;
        }
    };

    return `${prefixText}${parameters.join(',')}${suffixText}`;
}

/**
 * Returns a new transform with keys compatible with cloudinary and delete undefined entries
 */
const clearDuplicatesInTransform = (transform: Transform) => {
    const result = {
        w: transform.w ?? transform.width,
        h: transform.h ?? transform.height,
        g: transform.g ?? transform.gravity,
        c: transform.c ?? transform.crop,
        a: transform.a ?? transform.angle,
        ar: transform.ar ?? transform.aspect_ratio,
    };

    return Object.fromEntries(
        Object.entries(result).filter(([_, value]) => value !== undefined)
    ) as Transform;
};

export const selectBestWidth = (width: number) => {
    return defaultWidths.find(resolution => width <= resolution) ?? defaultWidth;
}

export const selectBestHeight = (height: number) => {
    return defaultHeights.find(resolution => height <= resolution) ?? defaultHeight;
}

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
}

export const generateCloudinaryUrl = ({ src, usePreset, transform, size }: { src: string, usePreset?: boolean, transform?: Transform, size?: CloudinarySize }) => {
    const baseUrl = `https://${PUBLIC_CLOUDINARY_CNAME}/image/upload/`;
    let url = src;
    if (usePreset) {
        url = `${PUBLIC_CLOUDINARY_UPLOAD_PRESET}${url}`;
    }

    return `${baseUrl}${transform ? transformToString(transform, { suffixText: '/' }) : ''}${url}${size ? ` ${size}` : ''}`;
}