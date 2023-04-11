import { DiscordPlayer } from "../../logic/music";
import { Command, CommandContext, isMessage } from "../command";

export default class PlayCommand implements Command {
    name = "play";

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