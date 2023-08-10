import { TextBasedChannel } from "discord.js";
import * as DEFAULT from "../commands/music/messages";
import { LoggerWithLabel } from "../common/logger";
import { ExtendedClient } from "./extended-client";

export class DiscordPlayerLogger {
    constructor(client: ExtendedClient) {
        const logger = LoggerWithLabel("Discord Player");

        const player = client.musicPlayer;

        player.events.on("audioTrackAdd", (queue, track) => {
            const { channel } = (queue.metadata as { channel: TextBasedChannel | null});
            // @ts-ignore
            channel?.send(DEFAULT.ADDED_TRACK(track));
            logger.info("Added track" + track.title);
        });

        player.events.on("audioTracksAdd", (queue, tracks) => {
            const { channel } = (queue.metadata as { channel: TextBasedChannel | null});
            // @ts-ignore
            channel?.send(DEFAULT.ADDED_TRACKS(tracks));
        });

        player.events.on("disconnect", (queue) => {
            const { channel } = (queue.metadata as { channel: TextBasedChannel | null});
            // @ts-ignore
            channel?.send(DEFAULT.STOPPED);
        });

        player.events.on("debug", (queue, msg) => {
            logger.debug(msg);
        });

        player.events.on("playerStart", (queue, track) => {
            const { channel } = (queue.metadata as { channel: TextBasedChannel | null});
            // @ts-ignore
            channel?.send(DEFAULT.NOW_PLAYING(track));
        });

        player.events.on("playerSkip", (queue, track) => {
            const { channel } = (queue.metadata as { channel: TextBasedChannel | null});
            // @ts-ignore
            channel?.send(DEFAULT.SKIPPED);
        });

        player.eventNames().forEach(name => {
            player.events.on(name, (...args:any[]) => {
                logger.debug(`${name.toUpperCase()} ${args}`);
            });
        });
    }

}