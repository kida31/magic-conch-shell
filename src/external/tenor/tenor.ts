import { request } from 'undici';
import { logger } from '../../common/logger';
import * as dotenv from "dotenv";
import { GifFormat, MediaFormats, MediaObject, SearchOptions, TenorResponse } from "./types";

dotenv.config();
const BASE_URL = 'https://tenor.googleapis.com/v2/search?'

let { TENOR_API: TENOR_KEY } = process.env;

const FALLBACK_FORMAT: GifFormat = GifFormat.tinygif;

const stringifyOptions = (options: SearchOptions): string => Object.entries(options).map(([k, v]) => k + '=' + v).join("&");

/**
 * General search endpoint for Tenor
 * @param options 
 * @returns 
 */
export async function search(options: SearchOptions): Promise<TenorResponse> {
    options.key = options.key ?? TENOR_KEY;
    const searchUrl = BASE_URL + stringifyOptions(options);
    console.error(searchUrl);
    logger.info("TenorSearch: " + searchUrl);
    const response = await request(searchUrl);
    const json = await response.body.json()
    return json;
}

/** Cache search results for quick access */
const SEARCH_CACHE: { [query: string]: Set<string> } = {}
const GIF_CACHE: { [id: string]: MediaFormats } = {}

export async function quickRandomSearch(options: SearchOptions): Promise<MediaObject> {
    function random<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }

    const randomFormat: GifFormat = random(options.media_filter ?? [FALLBACK_FORMAT]);
    options.media_filter = [randomFormat];

    if (!(options.q in SEARCH_CACHE)) {
        // If query not used yet
        SEARCH_CACHE[options.q] = new Set<string>();
    }

    if (Array.from(SEARCH_CACHE[options.q].values())
        .map(id => GIF_CACHE[id])
        .filter(mediaFormats => randomFormat in mediaFormats)
        .length == 0) {
        // if query exists, but not of the right format. QUERY PICTURES
        logger.notice("Pulling new images", { q: options.q, media_filter: options.media_filter });
        options.limit = options.limit ?? 50;
        const images = await search(options).then(res => res.results);
        for (const img of images) {
            SEARCH_CACHE[options.q].add(img.id);
            if (!(img.id in GIF_CACHE)) {
                GIF_CACHE[img.id] = {};
            }

            GIF_CACHE[img.id][randomFormat] = img.media_formats[randomFormat];
        }
    }

    const imagesWithFormat = Array.from(SEARCH_CACHE[options.q])
        .map(id => GIF_CACHE[id])
        .filter(img => randomFormat in img)
        .map(gif => gif[randomFormat]!);
    return random(imagesWithFormat);
}





