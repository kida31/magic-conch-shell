import { Command, CommandCategory, CommandContext, isMessage } from "../command";
import { MusicContext } from "../../music/music-context";

import { isRepeatMode } from "../../music/types";
import { ExtendedClient } from "../../core/extended-client";

export default class RepeatModeCommand implements Command {
    name = "repeat";
    category: CommandCategory = "Music";
    async execute(client: ExtendedClient, context: CommandContext) {
        const music = new MusicContext(client.musicPlayer, context.guild!.id);
        if (isMessage(context)) {
            const text = context.content;
            if (isRepeatMode(text)) {
                music.setMode(text);
                await context.react("✅");
            } else {
                await context.react("❌");
            }
        }
    }
}
