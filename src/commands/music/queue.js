import {getPlayer} from "../../services/music";

import {EmbedBuilder} from "discord.js";


async function main(interaction){
    const player = getPlayer()
    const queue = player.getQueue(interaction.guild)
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