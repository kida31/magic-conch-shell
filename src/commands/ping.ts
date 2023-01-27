import { Command } from "./command.ts";

import {
    CacheType,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
} from "discord.js";

export const ping: Command = {
    data:
        new SlashCommandBuilder()
            .setName("ping")
            .setDescription("Replies with Pong!"),
    async execute(interaction: ChatInputCommandInteraction<CacheType>,) {
        await interaction.reply("Pong!" + interaction.user.toString());
    }
}
