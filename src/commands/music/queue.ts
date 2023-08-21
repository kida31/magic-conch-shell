import { Command, CommandCategory, CommandContext, isMessage } from "../command";
import { MusicCommandMessage } from "./messages";
import { MusicContext } from "../../music/music-context";
import { ExtendedClient } from "../../core/extended-client";

export default [
    class QueueCommand implements Command {
        name = "queue";
        category: CommandCategory = "Music";

        async execute(client: ExtendedClient, context: CommandContext) {
            const music = new MusicContext(client.musicPlayer, context.guild!.id);
            if (isMessage(context)) {
                const current = music.getCurrentSong() ?? undefined;
                const songs = music.getQueue();
                const progressBar = music.getProgressBar() ?? undefined;
                await context.channel.send(MusicCommandMessage.QUEUED_TRACKS(songs, current, progressBar));
            }
        }
    }
]