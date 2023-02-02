import { QueueCommand } from "../../templates/Music";
import { SlashCommandBuilder } from "discord.js";


class SlashQueueCommand extends QueueCommand {
    data = new SlashCommandBuilder()
        .setName("queue")
        .setDescription("Show tracks in current queue");
}

export default new SlashQueueCommand();
