import express from "express";
import {Player, Track} from "discord-player";
import {MusicContext} from "./music-context";
import {LoggerWithLabel} from "../common/logger";

const logger = LoggerWithLabel("Music REST");
export default function MusicRouter(player: Player) {
    const router = express.Router();

    // Link router for music player
    router.get("/", (req, res, next) => {
        logger.info("/");
        throw new Error('BROKEN');
    });

    router.post("/:guildId/next", (req, res, next) => {
        logger.info("/:guildId/next");
        const ctx = new MusicContext(player, req.params.guildId);
        const nextTrack = ctx.skipSong();
        res.json(nextTrack);
    });

    router.post("/:guidId/prev", (req, res, next) => {
        logger.info("/:guildId/prev")
        res.send("Ok");
    });

    router.get("/:guildId/current", (req, res, next) => {
        logger.info("/:guildId/current");
        const ctx = new MusicContext(player, req.params.guildId);
        const result: Track | null = ctx.getCurrentSong();
        res.status(200).json(result);
    });

    router.get("/:guildId/current-channel", (req, res, next) => {
        logger.info("/:guildId/current-channel");
        const q = player.nodes.get(req.params.guildId);
        const ch = q?.channel;
        res.status(200).json(ch);
    });

    router.get("/:guildId/timestamp", (req, res, next) => {
        logger.info("/:guildId/timestamp");
        const ctx = new MusicContext(player, req.params.guildId);
        const result = ctx.getTimestamp();
        res.json(result);
    });

    router.post("/:guildId/play", (req, res, next) => {
        logger.info("/:guildId/play");
        const ctx = new MusicContext(player, req.params.guildId);
        const {url, query, channelId} = req.body;

        if (!query && !url) {
            res.status(400).send({
                message: "Missing url or query parameter in body"
            });
            return;
        }

        if (!channelId) {
            res.status(400).send({
                message: "Missing channel id"
            });
            return;
        }

        ctx.play(channelId, query ?? url, "API")
            .then(track => res.json(track))
            .catch(next);
    })

    router.post("/:guildId/join", (req, res, next) => {
        logger.info("/:guildId/join");
        return;

        const ctx = new MusicContext(player, req.params.guildId);
        const {channelId} = req.body;

        if (!channelId) {
            res.status(400).send({
                message: "Missing channel id"
            });
            return;
        }

        ctx.join(channelId).then((ch) => res.json(ch)).catch(next);
    })

    router.post("/:guildId/add", (req, res, next) => {
        logger.info("/:guildId/add");
        const ctx = new MusicContext(player, req.params.guildId);
        const {url, query} = req.body;
        ctx.add(query ?? url, "API").then(res.json).catch(next);
    })

    router.get("/:guildId/queue", (req, res, next) => {
        logger.info("/:guildId/queue");
        const ctx = new MusicContext(player, req.params.guildId);
        res.status(200).json(ctx.getQueue());
    });

    return router;
}
