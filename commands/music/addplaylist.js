const music = require("../../services/music");
const {SlashCommandBuilder, EmbedBuilder} = require("discord.js");
const RESPONSE = require('../../common/response')
const {QueryType} = require("discord-player");
require("../../common/formatting")

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addplaylist')
        .setDescription('Add a playlist to the queue (only youtube)')
        .addStringOption(option =>
            option
                .setName('q')
                .setDescription("url/query/search")
                .setRequired(true)
                .setMaxLength(100))
        .addBooleanOption(option =>
            option
                .setName('shuffle')
                .setDescription('Shuffle the content before queueing')),
    async execute(interaction) {
        // arrange
        const player = music.getPlayer();
        const query = interaction.options.getString("q");
        const doShuffle = interaction.options.getBoolean('shuffle') ?? false;

        // act
        await interaction.deferReply();

        let queue = player.getQueue(interaction.guild);
        if (!queue) {
            queue = player.createQueue(interaction.guild);
            console.log("Created queue for " + interaction.guild.name);
        }

        const result = await player.search(query, {
            requestedBy: interaction.user,
            searchEngine: QueryType.YOUTUBE_PLAYLIST
        })

        if (result.playlist === null) {
            await interaction.editReply("no results");
            return;
        }

        const shuffledTracks = doShuffle
            ? result.tracks.sort((a, b) => 0.5 - Math.random())
            : result.tracks;
        queue.addTracks(shuffledTracks);
        await queue.play();


        // reply
        const pl = result.playlist
        const totalDuration = shuffledTracks
            .map(t => t.duration)
            .map(dur => dur.toSeconds())
            .reduce((a, b) => a + b, 0);

        await interaction.editReply({
            embeds: [new EmbedBuilder()
                .setDescription(`Added ${shuffledTracks.length} songs from **[${pl.title}](${pl.url})** playlist to the queue.`
                    + shuffledTracks.toFormattedTrackString())
                .setFooter({
                    text: `Duration: ${totalDuration.toHHMMSS()}`
                })
                .setThumbnail(pl.thumbnail.url)
            ]
        })
    }
}