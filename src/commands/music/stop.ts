import { Command, CommandCategory, CommandContext, isMessage } from "../command";
import {MusicContext} from "../../music/music-context";
import { ExtendedClient } from "../../core/extended-client";

export default class StopCommand implements Command {
    name = "stop";
    category: CommandCategory = "Music";

    async execute(client: ExtendedClient, context: CommandContext) {
        const music = new MusicContext(client.musicPlayer, context.guild!.id);
        music.stop();
        if (isMessage(context)) {
            await context.react("✅");
        }
    }
}