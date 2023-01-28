import { SlashCommandBuilder } from "discord.js";
import { Command } from '../Command.ts';
import { QueryType } from "discord-player";

const querychoices = Object.keys(QueryType).filter(k => isNaN(k)).asChoices()

export const play: Command = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play some music!')
        .addStringOption(option => option
            .setName('q')
            .setDescription("url/query/search")
            .setRequired(true)
            .setMaxLength(100))
        .addStringOption(option =>
            option.setName('querytype')
                .setDescription('discord-player:QueryType')
                .addChoices(...querychoices)),
    async execute(interaction) {

    }
}
