import { DiscordPlayer, RepeatMode, isRepeatMode } from "../../logic/music";
import { Command, CommandCategory, CommandContext, isMessage } from "../command";

export default class RepeatModeCommand implements Command {
    name = "repeat";
    category: CommandCategory = "Music";
    async execute(context: CommandContext) {
        const music = new DiscordPlayer(context);
        if (isMessage(context)) {
            const text = context.content;
            if (isRepeatMode(text)) {
                await music.setMode(text);
                await context.react("✅");
            } else {
                await context.react("❌");
            }
        }
    }
}