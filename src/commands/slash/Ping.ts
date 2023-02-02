import {
    CacheType,
    Interaction,
    SlashCommandBuilder
} from "discord.js";
import { SlashCommand } from "../Command";


class SlashPingCommand implements SlashCommand {
    data = new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with Pong!")

    async execute(interaction: Interaction<CacheType>) {
        if (!interaction.isRepliable()) return;
        await interaction.reply("Pong!" + interaction.user.toString());
    }
}

export default new SlashPingCommand;
