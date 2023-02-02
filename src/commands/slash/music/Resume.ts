import { ResumeCommand } from "../../templates/Music";
import { SlashCommandBuilder } from "discord.js";


class SlashResume extends ResumeCommand {
    data = new SlashCommandBuilder()
        .setName("resume")
        .setDescription("Resume music playback");
}

export default new SlashResume();
