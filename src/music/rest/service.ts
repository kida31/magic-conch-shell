import express, { Router } from "express";
import bodyparser from "body-parser";
import { Track, Player, GuildQueue, QueueRepeatMode } from "discord-player";
import { Client, GuildResolvable } from "discord.js";
import { MusicContext } from "../music-context";
import { Router as InfoRouter } from "../../discord-info/guild-info-rest";
import { InvalidArgumentException } from "../../common/error";
import { channel } from "diagnostics_channel";
const PORT = 8080;

function createRouter(player: Player) {
    const router = express.Router();

    // Link router for music player
    router.get("/", (req, res) => {
        res.json("This is the homepage")
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

    router.post("/:guildId/play", async (req, res) => {
        const ctx = new MusicContext(player, req.params.guildId);
        const { url, query, channelId } = req.body;
        if (!!query) {
            const track = await ctx.play(channelId, query, "API");
            res.json(track);
        } else {
            const track = await ctx.play(channelId, url, "API");
            res.json(track);
        }
    })

    router.get("/channels", async (req, res) => {
        res.json(player.client.channels.cache);
    })

    return router;
}

export class MusicRestService {
    routes: Map<string, Router> = new Map();

    constructor(options: {
        player: Player,
        client: Client,
        [key: string]: any
    }) {
        this.routes.set("/info", InfoRouter(options.client));
        this.routes.set("/music", createRouter(options.player));
    }

    async start() {
        const app = express();

        app.use(bodyparser.json());
        this.routes.forEach((router, path) => {
            console.log("Registered " + path);
            app.use(path, router);
        });
        app.use((err: any, req: any, res: any, next: any) => {
            console.error(err);
            res.status(500).json({
                message: err.message
            });
        });

        // start the Express server
        app.listen(PORT, () => {
            console.log(`server started at http://localhost:${PORT}`);
        });
    }
}
