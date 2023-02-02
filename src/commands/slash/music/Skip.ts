import { SkipCommand } from "../../templates/Music";
import { SlashCommandBuilder } from "discord.js";


class SlashSkipCommand extends SkipCommand {
    data = new SlashCommandBuilder()
        .setName("skip")
        .setDescription("Skip to the next song");
}

export default new SlashSkipCommand();
