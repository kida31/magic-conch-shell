import { DiscordPlayer } from "../../logic/music";
import { Command, CommandContext, isMessage } from "../command";
import { MusicCommandMessage } from "./messages";

export default [
    class QueueCommand implements Command {
        name = "queue";

        async execute(context: CommandContext) {
            const music = new DiscordPlayer(context);
            if (isMessage(context)) {
                const channel = context.member?.voice.channel;
                if (channel) {
                    const current = await music.getCurrentSong() ?? undefined;
                    const songs = await music.getQueue() ?? [];
                    const progressBar = await music.getProgressBar() ?? undefined;
                    channel.send(MusicCommandMessage.QUEUED_TRACKS(songs, current, progressBar));
                }
            }
        }
    }
]