import { LogExecution, LoggerWithLabel } from "../../common/logger";
import { Anime, MyAnimeListAPI, SongInfo } from "./mal-api"

const logger = LoggerWithLabel("MyAnimeList API");

/**
 * These queries might contain many sub-requests. Use carefully or access might be blocked.
 */
export class MyAnimeListAPIExtended extends MyAnimeListAPI {
    @LogExecution(logger, "Get related animes")
    async getAllRelatedAnime(query: {id?: number, name?:string}): Promise<Anime[]> {
        return await this._getAllRelatedAnime(query);
    }

    @LogExecution(logger, "Get all related Songs")
    async getAllSongs(query: {id?: number, name?:string}): Promise<any> {
        const animes = await this._getAllRelatedAnime(query);
        console.log(animes);
        return animes.map(a => [...(a.opening_themes ?? []), ...(a.ending_themes ?? [])]).flat();
    }

    private async _getAllRelatedAnime(query: {id?: number, name?:string}): Promise<Anime[]> {
        if (!query.id && !query.name) throw new Error("Missing argument");
        const id = !!query.id ? query.id : (await this._getAnimeList(query.name!).then(res => res[0]!.id));

        let MAX_ITERATIONS: number = 20;
        const collected: { [key: string]: Anime } = {};

        const _getAllRelatedAnime = async (id: number): Promise<void> => {
            if (id in collected) return;

            if (MAX_ITERATIONS <= 0) {
                console.log("Reached max calls", id);
                return;
            };
            MAX_ITERATIONS -= 1;

            const anime = await this._getAnimeDetails(id);
            // console.log(`Found ${anime?.id}:${anime?.title}`);
            if (anime?.id) {
                collected[anime.id] = anime;
                for (const rel of anime.related_anime) {
                    await _getAllRelatedAnime(rel.id);
                }
            }

        }

        await _getAllRelatedAnime(id);
        return Object.values(collected);
    }
}