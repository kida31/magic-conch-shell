import express, { Router } from "express";
import bodyparser from "body-parser";
import { Track, Player, GuildQueue, QueueRepeatMode } from "discord-player";
import { Client, GuildResolvable } from "discord.js";
import { getCurrentTrack, playQuery } from "../discord-player-action";
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
        const guildId = req.params.guildId;
        
        res.json({
            message: "Ok"
        })
    });
    
    router.post("/:guidId/prev", (req, res) => {
        res.send("Ok");
    });
    
    router.get("/:guildId/current", (req, res) => {
        const result = getCurrentTrack(player, req.params.guildId);
        res.json(result);
    });

    router.post("/play", async (req, res) => {
        console.log("body", req.body);
        const { url, query, channelId }  = req.body;
        if (!!query) {
            const track  = await playQuery(player, channelId, query);
            res.json(track);
        } else {
            const track  = await playQuery(player, channelId, url);
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
