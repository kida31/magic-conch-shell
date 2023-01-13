const music = require("../../services/music");
const {SlashCommandBuilder, EmbedBuilder} = require("discord.js");
const {QueryType} = require("discord-player");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('music')
        .setDescription('Discord music player')
        .addSubcommand(subcommand =>
            subcommand
                .setName('search')
                .setDescription('search a song')
                .addStringOption(option =>
                    option
                        .setName('searchterm')
                        .setDescription('A query term')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('count')
                        .setDescription('How many songs do you want to queue')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('play')
                .setDescription('Play a song from link')
                .addStringOption(option =>
                    option
                        .setName('searchterm')
                        .setDescription('A query term')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('playlist')
                .setDescription('Play a youtube playlist')
                .addStringOption(option =>
                    option
                        .setName('searchterm')
                        .setDescription('A query term')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('leave')
                .setDescription('Tells bot to leave the voice channel')
        ).addSubcommand(subcommand =>
            subcommand
                .setName('queue')
                .setDescription('Shows queued songs')
                .addIntegerOption(option =>
                    option.setName('count')
                        .setDescription('How many songs you want to queue')
                        .setMinValue(0)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('skip')
                .setDescription('Skips to current song')),
    async execute(interaction) {
        if (interaction.options.getSubcommand() === "leave") {
            const queue = await music.getPlayer().getQueue(interaction.guild);
            if (queue) {
                await queue.destroy();
                await interaction.reply("Bye");
            }
            return;
        }

        const channel = interaction.member.voice.channel

        if (!channel) {
            await interaction.reply({
                content: "You have to be in a voice channel to use this",
                ephemeral: true
            })
            return;
        }
        const player = music.getPlayer();


        let queue = await player.getQueue(interaction.guild)
        if(!queue){
            queue = await player.createQueue(interaction.guild, {autoSelfDeaf: false});
            console.log("Created new queue");
            await queue.connect(interaction.member.voice.channel)
            console.log("Connected to channel")
        }

        await ({
            search,
            play,
            skip,
            playlist,
            'queue': showQueue
        }[interaction.options.getSubcommand()])(player, queue, interaction)
    },
};

async function playlist(player, queue, interaction) {
}

async function showQueue(player, queue, interaction) {
    if (!queue || queue.tracks.length === 0) {
        await interaction.reply("Queue is empty.");
        return;
    }

    let count = interaction.options.getInteger("count");
    count = count > 0 ? count : 10;

    console.log(count);

    const queueText = queue.tracks
        .slice(0, count)
        .map((song, i) => `${i + 1} ${song.title} [${song.duration}]`)
        .join('\n');

    await interaction.reply({
        embeds: [new EmbedBuilder()
            .setTitle(`Currently playing: ${queue.current.title}`)
            .setDescription("Queue\n" + queueText)
            .setThumbnail(queue.current.thumbnail)
            .setFooter({
                text: "Total duration: " + queue.tracks
                    .map(t => t.duration)
                    .map(dur => dur.toSeconds())
                    .reduce((a, b) => a + b, 0)
                    .toHHMMSS()
            })]
    });
}

String.prototype.toSeconds = function () {
    const parts = this.split(":").map(s => parseInt(s));
    if (parts.length === 3) {
        return (parts[0] * 3600) +
            (parts[1] * 60) +
            (parts[2]);
    } else {
        return parts[0] * 60 + parts[1];
    }
}


Number.prototype.toHHMMSS = function () {
    const sec_num = this; // don't forget the second param
    let hours = Math.floor(sec_num / 3600);
    let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    let seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours < 10) {
        hours = "0" + hours;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    return hours + ':' + minutes + ':' + seconds;
}