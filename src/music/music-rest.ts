import express from "express";
import { Track, Player } from "discord-player";
import { MusicContext } from "./music-context";


export default function MusicRouter(player: Player) {
    const router = express.Router();

    // Link router for music player
    router.get("/", (req, res) => {
        res.json("base url for music")
    });

    router.post("/:guildId/next", (req, res) => {
        const ctx = new MusicContext(player, req.params.guildId);
        const nextTrack = ctx.skipSong();
        res.json(nextTrack);
    });

    router.post("/:guidId/prev", (req, res) => {
        res.send("Ok");
    });

    router.get("/:guildId/current", (req, res) => {
        const ctx = new MusicContext(player, req.params.guildId);
        const result: Track | null = ctx.getCurrentSong();
        res.json(result);
    });

    router.get("/:guildId/timestamp", (req, res) => {
        const ctx = new MusicContext(player, req.params.guildId);
        const result = ctx.getTimestamp();
        res.json(result);
    });

    router.post("/:guildId/play", async (req, res) => {
        const ctx = new MusicContext(player, req.params.guildId);
        const { url, query, channelId } = req.body;

        if (!query && !url) {
            res.status(400).send({
                message: "Missing url or query parameter in body"
            });
        }

        const track = await ctx.play(channelId, query ?? url, "API");
        res.json(track);
    })

    router.post("/:guildId/add", async (req, res) => {
        const ctx = new MusicContext(player, req.params.guildId);
        const { url, query } = req.body;

        const track = await ctx.add(query ?? url, "API");
        res.json(track);
    })

    router.get("/:guildId/queue", (req, res) => {
        const ctx = new MusicContext(player, req.params.guildId);
        res.json(ctx.getQueue());
    });

    return router;
}
