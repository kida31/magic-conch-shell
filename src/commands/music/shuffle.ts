import { Command, CommandCategory, CommandContext, isMessage } from "../command";
import {MusicContext} from "../../music/music-context";
import { ExtendedClient } from "../../core/extended-client";

export default class ShuffleCommand implements Command {
    name = "shuffle";
    category: CommandCategory = "Music";
    async execute(client: ExtendedClient, context: CommandContext) {
        const music = new MusicContext(client.musicPlayer, context.guild!.id);
        music.shuffleQueue();
        if (isMessage(context)) {
            await context.react("✅");
        }
    }
}