import { PUBLIC_CLOUDINARY_UPLOAD_PRESET } from "$env/static/public";
import { Cloudinary, type Transform } from "$lib/cloudinary"
import type { ImageDimensions } from "$types";
import { filename } from ".";

export const getBreakpoint = (width: number) => Cloudinary.breakpoints(width);

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

export const getOfflineImage = ({ source, isLocaleImage }: { source: string, isLocaleImage: boolean }) => {
    let localeImage = isLocaleImage ?? true;
    if (source.startsWith('http') || !localeImage) {
        return '/pages/themes/cathedrale_skate.jpg';
    }
    return source.startsWith('/') ? source : `/${source}`;
}

export const getImagePath = (source: string) => {
    return source.startsWith('http') || source.startsWith('/') ? source : `/${source}`;
}

export const getImage = ({ source, useCloudinaryPreset, inCloudinary, isOfflineMode, transform }: {
    source: string,
    useCloudinaryPreset?: boolean,
    inCloudinary: boolean,
    isOfflineMode: boolean,
    transform: Transform,
}) => {
    if (isOfflineMode) return getOfflineImage({ source, isLocaleImage: !inCloudinary })
    if (source.startsWith('http') || !inCloudinary) return getImagePath(source);

    const path = useCloudinaryPreset
        ? `${PUBLIC_CLOUDINARY_UPLOAD_PRESET}${filename(source)}`
        : filename(source);

    return Cloudinary.make(path).url(transform);
}