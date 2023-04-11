import { DiscordPlayer } from "../../logic/music";
import { Command, CommandCategory, CommandContext, isMessage } from "../command";

export default class PlayCommand implements Command {
    name = "play";
    category: CommandCategory = "Music";

    async execute(context: CommandContext) {
        const music = new DiscordPlayer(context);
        if (isMessage(context)) {
            const channel = context.member?.voice.channel;
            if (channel) {
                await music.play(channel, context.content);
            }
        }
    }
}