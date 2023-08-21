import { Command, CommandCategory, CommandContext, isMessage } from "../command";
import {DiscordPlayerAction} from "../../music/discord-player-action";

export default class SkipCommand implements Command {
    name = "skip";
    category: CommandCategory = "Music";
    async execute(client: ExtendedClient, context: CommandContext) {
        const music = new DiscordPlayerAction(context);
        await music.skipSong();
    }
}