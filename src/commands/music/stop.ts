import { DiscordPlayer } from "../../logic/music";
import { Command, CommandCategory, CommandContext, isMessage } from "../command";

export default class StopCommand implements Command {
    name = "stop";
    category: CommandCategory = "Music";

    async execute(context: CommandContext) {
        const music = new DiscordPlayer(context);
        await music.stop();
        if (isMessage(context)) {
            await context.react("✅");
        }
    }
}