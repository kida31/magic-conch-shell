import { MyAnimeListAPI } from "./applets/my-anime-list/mal-api";
import * as dotenv from "dotenv";
import { MyAnimeListAPIExtended } from "./applets/my-anime-list/mal-extended";

dotenv.config();

const { MAL_ACCESS_TOKEN, MAL_CLIENT_ID } = process.env

const CONFIG = {
    headers: {
        Authorization: `Bearer ${MAL_ACCESS_TOKEN}`,
    }
};

(async () => {
    const api = new MyAnimeListAPIExtended(MAL_CLIENT_ID!);
    const songs = await api.getAnimeDetails(31964);
})();