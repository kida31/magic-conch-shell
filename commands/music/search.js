const music = require("../../services/music");
const {SlashCommandBuilder, EmbedBuilder} = require("discord.js");
const {QueryType} = require("discord-player");
const response = require('../../common/response')
const formatting = require('../../common/formatting')

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
        .addIntegerOption(option =>
            option.setName('n')
                .setDescription("number of search results to add")
                .setMinValue(1)
                .setMaxValue(100)),
    async execute(interaction) {
        // arrange
        const player = music.getPlayer();
        const query = interaction.options.getString("q");
        let count = interaction.options.getInteger("n") ?? 1;

        // act
        let queue = await player.getQueue(interaction.guild);
        if (!queue) {
            queue = await player.createQueue(interaction.guild)
        }
        const result = await player.search(query, {
            requestedBy: interaction.user,
            searchEngine: QueryType.AUTO
        })
        if (result.tracks.length === 0) {
            await interaction.reply(response.NO_RESULTS);
            return;
        }
        const tracks = result.tracks.slice(0, count);
        await queue.addTracks(tracks);
        await queue.play();


        // reply
        const duration = tracks
            .map(t => t.duration)
            .map(s => s.toSeconds())
            .reduce((a, b) => a + b, 0)
            .toHHMMSS()
        const tracksAsString = tracks
            .slice(0, 10)
            .map(t => `${[t.duration]} ${t.title}`)
            .join('\n')
        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(`Added ${tracks.length} songs to the queue.\n` + tracksAsString)
                    .setFooter({text: "Total duration: " + duration})
            ]
        })
    }
}