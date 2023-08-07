import { Command, CommandCategory, CommandContext, isMessage } from "../command";
import {DiscordPlayerAction} from "../../music/discord-player-action";

import {isRepeatMode} from "../../music/types";

export default class RepeatModeCommand implements Command {
    name = "repeat";
    category: CommandCategory = "Music";
    async execute(context: CommandContext) {
        const music = new DiscordPlayerAction(context);
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
