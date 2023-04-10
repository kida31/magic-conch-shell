import axios, { AxiosError } from 'axios';
import { LoggerWithLabel, LogExecution } from '../../common/logger';

const logger = LoggerWithLabel("MyAnimeList API");

const BASE_URL = 'https://api.myanimelist.net/v2/';
const Endpoint = (path: string) => BASE_URL + path;

export interface AnimeSearchResult {
    id: number;
    title: string;
    main_picture: {
        medium: string;
        large: string;
    },
    alternative_titles: {
        synonyms: [],
        en: string,
        ja: string,
    }
    media_type: string,
    num_episodes: number,
    mean: number,
    rank: number,
    popularity: number,
}

export interface Anime extends AnimeSearchResult {
    related_anime: (Anime & {
        relation_type: string,
        relation_type_formatted: string
    })[]
    opening_themes?: SongInfo[],
    ending_themes?: SongInfo[],
}

export interface SimpleSearchResult {
    id: number,
    title: string,
    main_picture: {
        medium: string,
        large: string,
    }
}

export interface SongInfo {
    id:number,
    anime_id: number,
    text: string
}

function handleError(axiosError: any) {
    const error = <AxiosError>axiosError;

    if (!error) {
        throw new Error(error);
    }

    console.log(error.code);
    console.log(error.response?.status, error.response?.statusText);
}

/**
 * Basic API. Wraps all possible single requests for MAL API
 */
export class MyAnimeListAPI {
    private readonly search_fields = [
        'id',
        'title',
        'main_picture',
        'alternative_titles',
        'media_type',
        'num_episodes',
        'mean',
        'rank',
        'popularity',
    ];
    private readonly details_fields = [
        ...this.search_fields,
        "related_anime",
        'opening_themes',
        'ending_themes',
    ];

    access_token?: string;
    client_id: string;

    constructor(client_id: string, access_token?: string) {
        if (!access_token) console.log("No Auth token. Only public data will be available.");
        this.access_token = access_token;
        this.client_id = client_id;
    }

    get headers(): { 'Authorization'?: string, 'X-MAL-CLIENT-ID': string } {
        return { 'X-MAL-CLIENT-ID': this.client_id }
    }

    /**
     * Searches for animes
     * @param query 
     * @param limit 
     * @param fields 
     * @param nsfw 
     * @returns 
     */
    @LogExecution(logger, "Get anime list")
    async getAnimeList(query: string, limit?: number, fields?: string[], nsfw?: boolean): Promise<AnimeSearchResult[]> {
        return await this._getAnimeList(query, limit, fields, nsfw);
    }

    // Internal version for use in other queries.
    protected async _getAnimeList(query: string, limit?: number, fields?: string[], nsfw?: boolean): Promise<AnimeSearchResult[]> {
        try {
            const response = await axios.get(Endpoint('anime'), {
                headers: this.headers,
                params: {
                    q: query,
                    nsfw: nsfw ?? true,
                    limit: limit ?? 10,
                    fields: fields?.join(',') ?? this.search_fields.join(', ')
                }
            });
            return response.data.data.map((res: any) => res.node);
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    /**
     * Get details of an anime
     * @param id 
     * @param fields 
     * @param nsfw 
     * @returns 
     */
    @LogExecution(logger, "Get anime details")
    async getAnimeDetails(id: number, fields?: string[], nsfw?: boolean): Promise<Anime | null> {
        return await (this._getAnimeDetails(id, fields, nsfw));
    }

    // Internal version for use in other queries.
    protected async _getAnimeDetails(id: number, fields?: string[], nsfw?: boolean): Promise<Anime | null> {
        try {
            const response = await axios.get(Endpoint('anime/' + id), {
                headers: this.headers,
                params: {
                    nsfw: nsfw ?? true,
                    fields: fields?.join(',') ?? this.details_fields.join(",")
                }
            });

            const result = response.data;
            result.related_anime = result.related_anime?.map((anime: any) => {
                anime = { ...anime, ...anime.node };
                delete anime.node;
                return anime;
            });

            return result;
        } catch (error) {
            console.error(error);
            return null;
        }
    }
}