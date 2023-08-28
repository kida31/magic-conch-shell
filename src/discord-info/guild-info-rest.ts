import {Client} from "discord.js";
import express from "express";
import {InvalidArgumentException} from "../common/error";
import {getGuild, getVoiceChannels} from "./guild-info";

export default function InfoRouter(client: Client) {
    const router = express.Router();
    router
        .get("/:guildId", (req, res, next) => {
            const guildId = req.params.guildId;

            if (!guildId) {
                throw new InvalidArgumentException("Missing id");
            }
            const result = getGuild(client, guildId);

            // TODO restrict information as needed
            res.json(result);
        })
        .get("/:guildId/voice-channels", (req, res, next) => {
            const guidId = req.params.guildId;

            const result = getVoiceChannels(client, guidId);

            // TODO restrict information as needed
            res.json(result);
        })

    return router;
}