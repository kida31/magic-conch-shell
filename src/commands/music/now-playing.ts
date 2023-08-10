import {Command, CommandCategory, CommandContext, isMessage} from "../command";
import * as DefaultMessage from "./messages";
import {DiscordPlayerAction} from "../../music/discord-player-action";

export default class NowPlayingCommand implements Command {
    name = "nowplaying";
    alias = ["np"];
    category: CommandCategory = "Music";

    async execute(context: CommandContext) {
        if (isMessage(context)) {
            const dpa = new DiscordPlayerAction(context);
            const current = (await dpa.getCurrentSong()) ?? null;
            if (current) {
                const progressBar = (await dpa.getProgressBar()) ?? undefined;
                await context.channel.send(DefaultMessage.NOW_PLAYING(current, progressBar));
            } else {
                // pass
            }
        }
    }
}
