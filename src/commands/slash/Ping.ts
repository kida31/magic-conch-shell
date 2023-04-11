import {
    CacheType,
    Interaction,
    SlashCommandBuilder
} from "discord.js";
import { Command } from "../command";


class SlashPingCommand implements Command {
    name="ping";
    data = new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with Pong!")

    async execute(interaction: Interaction<CacheType>) {
        if (!interaction.isRepliable()) return;
        await interaction.reply("Pong!" + interaction.user.toString());
    }
}

export default new SlashPingCommand;
