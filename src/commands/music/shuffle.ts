import { Command, CommandCategory, CommandContext, isMessage } from "../command";
import {DiscordPlayerAction} from "../../music/discord-player-action";

export default class ShuffleCommand implements Command {
    name = "shuffle";
    category: CommandCategory = "Music";
    async execute(context: CommandContext) {
        const music = new DiscordPlayerAction(context);
        await music.shuffleQueue();
        if (isMessage(context)) {
            await context.react("✅");
        }
    }
}