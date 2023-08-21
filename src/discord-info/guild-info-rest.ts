import { Client } from "discord.js";
import express from "express";
import { InvalidArgumentException } from "../common/error";
import { getGuild, getVoiceChannels } from "./guild-info";

export const Router = (client: Client) => {
    const router = express.Router();
    router
        .get("/guild", (req, res, next) => {
            const id = req.query.id as string;

            if (!id) {
                throw new InvalidArgumentException("Missing id");
            }
            const result = getGuild(client, id);

            // TODO restrict information as needed
            res.json(result);
        })
        .get("/voice-channels", (req, res, next) => {
            const guidId = req.query.guildId as string;

            const result = getVoiceChannels(client, guidId);

            // TODO restrict information as needed
            res.json(result);
        })

    return router;
}