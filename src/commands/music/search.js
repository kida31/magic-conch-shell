import music from "../../services/music";

import {EmbedBuilder, SlashCommandBuilder} from "discord.js";

import {QueryType} from "discord-player";

import {SelectMenuForSearchResult} from "../../common/botresponses";

import common from "../../common/response";

import common0 from "../../common/formatting";

let response;
response = common;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('search some music!')
        .addStringOption(option =>
            option
                .setName('q')
                .setDescription("url/query/search")
                .setRequired(true)
                .setMaxLength(100))
        .addStringOption(option =>
            option.setName('querytype')
                .setDescription('discord-player:QueryType')
                .addChoices(...Object.keys(QueryType).filter(k => isNaN(k)).asChoices())),
    async execute(interaction) {
        const query = interaction.options.getString("q");
        const queryType = interaction.options.getString("queryType") ?? QueryType.YOUTUBE_SEARCH;
        console.log(`queryType=${queryType}, query=${query}`);

        let ctx = new music.MusicContext(interaction);
        let result = await ctx.search(query, queryType);

        console.log(Object.keys(result));
        await interaction.reply(response.QUIET_CONFIRM);
    }
}