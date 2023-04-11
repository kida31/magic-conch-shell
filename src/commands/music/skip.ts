import { DiscordPlayer } from "../../logic/music";
import { Command, CommandContext, isMessage } from "../command";

export default class SkipCommand implements Command {
    name = "skip";

    async execute(context: CommandContext) {
        const music = new DiscordPlayer(context);
        if (isMessage(context)) {
            const channel = context.member?.voice.channel;
            if (channel) {
                await music.skipSong();
            }
        }
    }
}