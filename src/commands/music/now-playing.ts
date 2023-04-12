import { DiscordPlayer } from "../../logic/music";
import { Command, CommandCategory, CommandContext, isMessage } from "../command";
import { MusicCommandMessage } from "./messages";

export default class NowPlayingCommand implements Command {
    name = "nowplaying";
    alias = ["np"];
    category: CommandCategory = "Music";

    async execute(context: CommandContext) {
        const music = new DiscordPlayer(context);
        if (isMessage(context)) {
            const current = (await music.getCurrentSong()) ?? null;
            const progressBar = (await music.getProgressBar()) ?? undefined;
            await context.channel.send(MusicCommandMessage.NOW_PLAYING(current, progressBar));
        }
    }
}
