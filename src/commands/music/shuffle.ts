import { DiscordPlayer } from "../../logic/music";
import { Command, CommandCategory, CommandContext, isMessage } from "../command";

export default class ShuffleCommand implements Command {
    name = "shuffle";
    category: CommandCategory = "Music";
    async execute(context: CommandContext) {
        const music = new DiscordPlayer(context);
        await music.shuffleQueue();
        if (isMessage(context)) {
            await context.react("✅");
        }
    }
}