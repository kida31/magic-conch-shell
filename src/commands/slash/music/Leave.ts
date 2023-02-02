import { StopCommand } from "../../templates/Music";
import { SlashCommandBuilder } from "discord.js";


class SlashLeaveCommand extends StopCommand {
    data = new SlashCommandBuilder()
        .setName("leave")
        .setDescription("Stop music play");
}

export default new SlashLeaveCommand();
