import { Player } from "discord-player";
import express, { Router } from "express";
import { Client } from "discord.js";
import bodyParser from "body-parser";
import MusicRouter from "./music/music-rest";
import InfoRouter from "./discord-info/guild-info-rest";

const PORT = 8080;

export class MusicRestService {
    routes: Map<string, Router> = new Map();

    constructor(options: {
        player: Player,
        client: Client,
        [key: string]: any
    }) {
        this.routes.set("/info", InfoRouter(options.client));
        this.routes.set("/music", MusicRouter(options.player));
    }

    async start() {
        const app = express();

        app.use(bodyParser.json());
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
