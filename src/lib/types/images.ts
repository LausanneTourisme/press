
export type PictureExtension = "png" | "jpg" | "jpeg" | "svg";
export type CloudinaryType = 'image' | 'video'
export type ImageDimensions = {
    width: number;
    height: number;
};

type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
type NonZeroDigit = Exclude<Digit, "0">;

type OneDigitWeek = `${NonZeroDigit}w`;
type TwoDigitWeek = `${NonZeroDigit}${Digit}w`;
type ThreeDigitWeek = `${NonZeroDigit}${Digit}${Digit}w`;
type FourDigitWeek = `${NonZeroDigit}${Digit}${Digit}${Digit}w`;

export type CloudinarySize = OneDigitWeek | TwoDigitWeek | ThreeDigitWeek | FourDigitWeek

type gravity = "face" | "auto" | "auto:none" | "north_east" | "north" | "north_west" | "south" | "east" | "south_east" | "west" | "south_west";
type crop = "auto" | "crop" | "fill" | "scale" | "thumb";

export type Transform = {
    width?: number;
    w?: number;
    height?: number;
    h?: number;
    gravity?: gravity;
    g?: gravity;
    crop?: crop;
    c?: crop;
    aspect_ratio?: string | number;
    ar?: string | number;
    angle?: number;
    a?: number;
    y?: number;
}