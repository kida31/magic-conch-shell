/**
 * Minimal interfaces for features
 */

export interface ChatBot {
    chat(text: string, username?: string): Promise<string | undefined>;
    read(text: string, username?: string): Promise<void>;
}

export interface GifBot {
    /**
     * Query for a gif
     * @param query search keyword
     */
    searchOne(query: string, options?: {}): Promise<string | { url: string }>;

    /**
     * Query for gifs
     * @param query search keyword
     */
    search(query: string, options?: {}): Promise<(string | { url: string })[]>;
}