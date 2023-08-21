import { Command, CommandCategory, CommandContext, isMessage } from "../command";
import { MusicCommandMessage } from "./messages";
import { MusicContext } from "../../music/music-context";
import { ExtendedClient } from "../../core/extended-client";

export default class NowPlayingCommand implements Command {
    name = "nowplaying";
    alias = ["np"];
    category: CommandCategory = "Music";

    async execute(client: ExtendedClient, context: CommandContext) {
        const music = new MusicContext(client.musicPlayer, context.guild!.id);
        if (isMessage(context)) {
            const current = (music.getCurrentSong()) ?? null;
            const progressBar = (music.getProgressBar()) ?? undefined;
            await context.channel.send(MusicCommandMessage.NOW_PLAYING(current, progressBar));
        }
    }
}
