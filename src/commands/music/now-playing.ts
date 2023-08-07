import { Command, CommandCategory, CommandContext, isMessage } from "../command";
import { MusicCommandMessage } from "./messages";
import {DiscordPlayerAction} from "../../music/discord-player-action";

export default class NowPlayingCommand implements Command {
    name = "nowplaying";
    alias = ["np"];
    category: CommandCategory = "Music";

    async execute(context: CommandContext) {
        const music = new DiscordPlayerAction(context);
        if (isMessage(context)) {
            const current = (await music.getCurrentSong()) ?? null;
            const progressBar = (await music.getProgressBar()) ?? undefined;
            await context.channel.send(MusicCommandMessage.NOW_PLAYING(current, progressBar));
        }
    }
}
