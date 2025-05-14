import type { Media, Translatable, Video as NovaVideo } from "./nova"

export type Hero = {
    type: "hero",
    tag: `h${1 | 2 | 3 | 4 | 5 | 6}`,
    value: Translatable,
    lead?: Translatable,
    color: "white" | "black",
    image: Media<Translatable>,
}

export type Heading = {
    type: "heading",
    tag: `h${1 | 2 | 3 | 4 | 5 | 6}`,
    value: Translatable,
}

export type Paragraphe = {
    type: "paragraph",
    value: Translatable,
}

export type Gallery = {
    type: "gallery",
    value: Media<Translatable>[],
}

export type Image = {
    type: "image",
    size: "parallax" | "small" | "medium" | "large",
    focus: "auto" | "face",
    value: Media<Translatable>,
}

export type Instagram = {
    type: "instagram",
    value: string,
}

export type Youtube = {
    type: "youtube",
    value: string,
}

export type Video = {
    type: "video",
    value: NovaVideo<Translatable>
}

export type Embed = {
    type: "embed",
    value: string
}

export type ContentBlock = Hero | Heading | Paragraphe | Gallery | Image | Instagram | Youtube | Video