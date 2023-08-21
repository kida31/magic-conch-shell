import { Command, CommandCategory, CommandContext, isMessage } from "../command";
import { MusicContext } from "../../music/music-context";
import { ExtendedClient } from "../../core/extended-client";

export default class PlayCommand implements Command {
    name = "play";
    category: CommandCategory = "Music";

    async execute(client: ExtendedClient, context: CommandContext) {
        const music = new MusicContext(client.musicPlayer, context.guild!.id);
        if (isMessage(context)) {
            const channel = context.member?.voice.channel;
            if (channel) {
                await music.play(channel.id, context.content, context.author, context.channel);
            }
        }
    }
}