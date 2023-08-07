import { Command, CommandCategory, CommandContext, isMessage } from "../command";
import { MusicCommandMessage } from "./messages";
import {DiscordPlayerAction} from "../../music/discord-player-action";

export default [
    class QueueCommand implements Command {
        name = "queue";
        category: CommandCategory = "Music";

        async execute(context: CommandContext) {
            const music = new DiscordPlayerAction(context);
            if (isMessage(context)) {
                const current = await music.getCurrentSong() ?? undefined;
                const songs = await music.getQueue() ?? [];
                const progressBar = await music.getProgressBar() ?? undefined;
                await context.channel.send(MusicCommandMessage.QUEUED_TRACKS(songs, current, progressBar));
            }
        }
    }
]