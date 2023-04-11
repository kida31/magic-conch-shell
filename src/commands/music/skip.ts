import { DiscordPlayer } from "../../logic/music";
import { Command, CommandCategory, CommandContext, isMessage } from "../command";

export default class SkipCommand implements Command {
    name = "skip";
    category: CommandCategory = "Music";
    async execute(context: CommandContext) {
        const music = new DiscordPlayer(context);
        await music.skipSong();
    }
}