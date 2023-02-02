import { StopCommand } from "../../templates/Music";
import { SlashCommandBuilder } from "discord.js";


class SlashStopCommand extends StopCommand {
    data = new SlashCommandBuilder()
        .setName("stop")
        .setDescription("Stop music play");
}

export default new SlashStopCommand();
