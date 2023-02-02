import { NowPlayingCommand } from "../../templates/Music";
import { SlashCommandBuilder } from "discord.js";


class SlashNowPlayingCommand extends NowPlayingCommand {
    data = new SlashCommandBuilder()
        .setName("nowplaying")
        .setDescription("Show currently played track");
}

export default new SlashNowPlayingCommand();
