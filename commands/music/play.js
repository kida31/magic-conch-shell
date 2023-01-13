const music = require("../../services/music");
const {SlashCommandBuilder, EmbedBuilder} = require("discord.js");
const {QueryType} = require("discord-player");
const response = require('../../common/response')
require('../../common/formatting')

const querychoices = Object.keys(QueryType).filter(k => isNaN(k)).asChoices()
module.exports = {
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
        // arrange
        const query = interaction.options.getString("q");


        // act
        const player = music.getPlayer();
        let queue = music.getQueue(interaction.guild);
        queue.connect(interaction.member.voice.channel)

        const result = await player.search(query, {
            requestedBy: interaction.user,
            searchEngine: QueryType.YOUTUBE_SEARCH
        })
        if (result.tracks.length === 0) {
            await interaction.reply(response.NO_RESULTS);
            return;
        }
        const song = result.tracks[0];
        await queue.addTrack(song);
        await queue.play();


        // reply
        await interaction.reply({
            embeds: [new EmbedBuilder()
                .setDescription(`Added **[${song.title}](${song.url})** to the queue.`)
                .setFooter({text: `Duration: ${song.duration}`})
                .setThumbnail(song.thumbnail)]
        });
    }
}

