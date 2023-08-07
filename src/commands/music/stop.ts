import { Command, CommandCategory, CommandContext, isMessage } from "../command";
import {DiscordPlayerAction} from "../../music/discord-player-action";

export default class StopCommand implements Command {
    name = "stop";
    category: CommandCategory = "Music";

    async execute(context: CommandContext) {
        const music = new DiscordPlayerAction(context);
        await music.stop();
        if (isMessage(context)) {
            await context.react("✅");
        }
    }
}