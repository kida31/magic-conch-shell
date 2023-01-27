import {ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder} from "discord.js";


function AddedOneSong(song) {
    return {
        embeds: [new EmbedBuilder()
            .setDescription(`Added **[${song.title}](${song.url})** to the queue.`)
            .setFooter({text: `Duration: ${song.duration}`})
            .setThumbnail(song.thumbnail)]
    };
}

function AddedPlaylist(playlist) {

}

function SelectMenuForSearchResult(tracks) {
    const row = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('select')
                .setPlaceholder('Choose from search results')
                .addOptions(...tracks.map(t =>
                    ({
                        label: t.title,
                        description: t.title,
                        value: t
                    })),
                ),
        )
    return {
        components: [row]
    }
}

module.exports = {
    AddedOneSong,
    AddedPlaylist,
    SelectMenuForSearchResult
}