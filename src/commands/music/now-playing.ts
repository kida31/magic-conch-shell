import { DiscordPlayer } from "../../logic/music";
import { Command, CommandContext, isMessage } from "../command";
import { MusicCommandMessage } from "./messages";

export default class NowPlayingCommand implements Command {
    name = "nowplaying";

    async execute(context: CommandContext) {
        const music = new DiscordPlayer(context);
        if (isMessage(context)) {
            const channel = context.member?.voice.channel;
            if (channel) {
                const current = await music.getCurrentSong() ?? null;
                const progressBar = await music.getProgressBar() ?? undefined;
                channel.send(MusicCommandMessage.NOW_PLAYING(current, progressBar));
            }
        }
    }
}
