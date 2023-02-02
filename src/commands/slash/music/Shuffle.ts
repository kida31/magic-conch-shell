import { ShuffleCommand } from "../../templates/Music";
import { SlashCommandBuilder } from "discord.js";


class SlashShuffleCommand extends ShuffleCommand {
    data = new SlashCommandBuilder()
        .setName("shuffle")
        .setDescription("Shuffle all queued songs");
}

export default new SlashShuffleCommand();
