import { request } from 'undici';
import { logger } from '../common/logger';
import * as dotenv from "dotenv";

dotenv.config();
const BASE_URL = 'https://tenor.googleapis.com/v2/search?'


let { TENOR_API: apiKey } = process.env;

function config(aKey: string) {
    console.log("Tenor: Set API Key")
    apiKey = aKey;
}

interface SearchParameter {
    q: string,
    client_key?: string,
    key?: string,
    media_filter?: string,
    limit?: number | string
}

function GET_DEFAULT(): SearchParameter {
    return {
        q: '',
        client_key: "TenorDefaultClient",
        key: apiKey,
        media_filter: "tinygif",
        limit: 50
    }
}

function appendDefault(parameters: SearchParameter): SearchParameter {
    return { ...GET_DEFAULT(), ...parameters }
}

function stringifyParameters(parameters: SearchParameter): string {
    const replaceSpace = (s: string) => s.split(' ').join('+');
    const parts: string[] = [];
    for (const [key, value] of Object.entries(parameters)) {
        parts.push(`${key}=${replaceSpace(value)}`);
    }

    return parts.join("&");
}

async function search(parameters: SearchParameter) {
    validateConfig();
    parameters = appendDefault(parameters);
    const searchUrl = BASE_URL + stringifyParameters(parameters);

    logger.info("TenorSearch: " + searchUrl);
    const response = await request(searchUrl);
    const json = await response.body.json()
    return json.results;
}

async function searchGifs(parameters: SearchParameter): Promise<string[]> {
    parameters = appendDefault(parameters);
    const res = await search(parameters);
    return res.map((item: { media_formats: { [x: string]: { url: any; }; }; }) =>
        item.media_formats[parameters.media_filter!].url);
}

function validateConfig(): void {
    logger.info("Validating search key TENOR")
    if (apiKey == null || apiKey == "") {
        logger.error("TENOR: API Key has not been set yet");
        throw new Error("API Key has not been set yet");
    }
}

export { searchGifs, search, config }
