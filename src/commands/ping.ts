import { Command } from "./Command";

import {
    CacheType,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
} from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with Pong!"),

    async execute(interaction: ChatInputCommandInteraction<CacheType>,) {
        await interaction.reply("Pong!" + interaction.user.toString());
    }
} as Command;
