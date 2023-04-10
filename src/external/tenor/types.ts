export interface SearchOptions {
    q: string,
    client_key?: string,
    key?: string,
    media_filter?: GifFormat[],
    limit?: number | string,
    contentfilter?: ContentFilter
    locale?: string,
    pos?: number | string
}

export enum MediaFilter {
    minimal = "minimal",
    basic = "basic"
}

export enum ContentFilter {
    off = "off",
    low = "low",
    medium = "medium",
    high = "high"
}

export interface TenorResponse {
    results: GifObject[],
    next: string
}

export type MediaFormats = { [key in GifFormat]?: MediaObject };

export interface GifObject {
    id: string,
    title: string,
    media_formats: MediaFormats,
    created: number,
    content_description: string
    itemurl: string,
    url: string,
    tags: string[]
    hasaudio: boolean,

    hascaption?: boolean,
    media?: any[],
}

export enum GifFormat {
    gif = "gif",
    mediumgif = "mediumgif",
    tinygif = "tinygif",
    nanogif = "nanogif",
    mp4 = "mp4",
    loopedmp4 = "loopedmp4",
    tinymp4 = "tinymp4",
    nanomp4 = "nanomp4",
    webm = "webm",
    tinywebm = "tinywebm",
    nanowebm = "nanowebm"
}

export interface MediaObject {
    url: string,
    preview: string,
    duration: number,
    dims: number[],
    size: number
}
