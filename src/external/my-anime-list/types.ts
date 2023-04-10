export interface AnimeSearchResult {
    id: number;
    title: string;
    main_picture: {
        medium: string;
        large: string;
    };
    alternative_titles: {
        synonyms: [];
        en: string;
        ja: string;
    };
    media_type: string;
    num_episodes: number;
    mean: number;
    rank: number;
    popularity: number;
}

export interface Anime extends AnimeSearchResult {
    related_anime: (Anime & {
        relation_type: string;
        relation_type_formatted: string;
    })[];
    opening_themes?: SongInfo[];
    ending_themes?: SongInfo[];
}

export interface SimpleSearchResult {
    id: number;
    title: string;
    main_picture: {
        medium: string;
        large: string;
    };
}

export interface SongInfo {
    id: number;
    anime_id: number;
    text: string;
}
