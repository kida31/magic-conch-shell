import { Command, CommandCategory, CommandContext, isMessage } from "../command";
import {MusicContext} from "../../music/music-context";
import { ExtendedClient } from "../../core/extended-client";

export default class SkipCommand implements Command {
    name = "skip";
    category: CommandCategory = "Music";
    async execute(client: ExtendedClient, context: CommandContext) {
        const music = new MusicContext(client.musicPlayer, context.guild!.id);
        music.skipSong();
    }
}