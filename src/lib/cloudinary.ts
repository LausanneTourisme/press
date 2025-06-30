import { PUBLIC_CLOUDINARY_CNAME, PUBLIC_CLOUDINARY_UPLOAD_PRESET } from "$env/static/public";
type gravity = "face" | "auto" | "north_east" | "north" | "north_west" | "south" | "east" | "south_east" | "west" | "south_west";
type crop = "auto" | "crop" | "fill" | "scale" | "thumb";
export type Transform = {
    width?: number | string;
    w?: number | string;
    height?: number | string;
    h?: number | string;
    gravity?: gravity,
    g?: gravity,
    crop?: crop,
    c?: crop,
    ar?: string
}

export class Cloudinary {
    protected id: string;
    protected parameters: string;
    protected type: string;
    protected extension: "png" | "jpg" | "jpeg" | "svg" | undefined;

    static DEFAULT_RESOLUTION: number = 1280;
    public static resolutions: number[] = [
        80, 120, 240, 320, 480, 640, 720, 960, Cloudinary.DEFAULT_RESOLUTION, 1640, 1920, 2560, 3840
    ];

    constructor(cloudinaryId: string, type: string = 'image') {
        if ([undefined, null, ''].includes(cloudinaryId)) {
            cloudinaryId = `${PUBLIC_CLOUDINARY_UPLOAD_PRESET}/default`;
        }

        this.id = cloudinaryId
            .replace(" ", "_")
            .replace(/[()]/ig, "")
            .replace(/\.(\w{1,4})$/i, '') as string;
        this.parameters = "";
        this.type = type;
        this.extension = cloudinaryId.match(/\.(\w{1,4})$/i)?.pop() as "png" | "jpg" | "jpeg" | "svg" | undefined;
    }

    public static make(cloudinaryId: string, type: string = 'image'): Cloudinary {
        return new Cloudinary(cloudinaryId, type);
    }

    public transform(transform: Transform): Cloudinary {
        const parameters: string[] = [];
        let resolution: number;

        for (const key in transform) {
            // Gravity & Crop first
            switch (key) {
                case "gravity":
                case "g":
                    parameters.push(`g_${transform[key]}`);
                    break;

                case "crop":
                case "c":
                    parameters.push(`c_${transform[key]}`);
                    break;

                case "width":
                case "w":
                    resolution = Cloudinary.breakpoints(<number>transform[key]);
                    parameters.push(`w_${resolution}`);
                    break;

                case "height":
                case "h":
                    resolution = Cloudinary.breakpoints(<number>transform[key]);
                    parameters.push(`h_${resolution}`);
                    break;

                case "ar":
                    parameters.push(`ar_${transform[key]}`);
                    break;

                default:
                    break;
            }
        };

        this.parameters = parameters.join(',') + "/";

        return this;
    }

    public url(transform: Transform | null = null) {
        if (transform) {
            this.transform(transform);
        }

        const extension: string = this.extension
            ? this.extension
            : (this.type === 'image' ? 'png' : 'webm');

        return `https://${PUBLIC_CLOUDINARY_CNAME}/${this.type}/upload/${this.parameters}${this.id}.${extension}`
    }

    public static breakpoints(width: number): number {
        return Cloudinary.resolutions.find(resolution => width <= resolution) ?? Cloudinary.DEFAULT_RESOLUTION;
    }
}