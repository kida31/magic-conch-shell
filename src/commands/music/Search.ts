import { CacheType, EmbedBuilder, SlashCommandBuilder, StringSelectMenuInteraction } from "discord.js";
const { ActionRowBuilder, Events, StringSelectMenuBuilder } = require('discord.js');

import { QueryType, Track } from "discord-player";

import { MusicCommandBuilder } from "../../utils/CommandBuilder/MusicCommandBuilder";
import { Command } from "../Command";
import { logger } from "../../common/logger";
import { MusicContext } from "../../applets/MusicContext";
import MenuInteractionHandler from "../../menuinteractions/MenuInteractionHandler";

export default new MusicCommandBuilder("search", "search for music!")
    .addQueryOption()
    .addQueryTypeOption()
    .addFunction(async (interaction): Promise<void> => {
        const query: string = interaction.options.getString("q")!;
        const queryType: QueryType | string = interaction.options.getString("queryType") ?? QueryType.YOUTUBE_SEARCH;
        logger.debug(`queryType=${queryType}, query=${query}`);

        let ctx = new MusicContext(interaction);
        await ctx.joinChannel();
        let result = await ctx.search(query, queryType);
        const trackOptions = result.tracks.map(t => ({
            label: t.title,
            description: `${t.author} [${t.duration}]`,
            value: t.id
        }))

        const customId = MenuInteractionHandler.getCustomId(interaction);

        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(customId)
                    .setPlaceholder("Choose a song")
                    .addOptions(...trackOptions));

        MenuInteractionHandler.registerInteraction(interaction, async (response: StringSelectMenuInteraction<CacheType>) => {
            const selected: Track = result.tracks.filter(t => t.id == response.values[0])[0]
            ctx.playTrack(selected);
            await interaction.editReply({ content: "You selected " + selected.title, components: [] });
        });

        await interaction.reply({
            content: `Found **${result.tracks.length}** results for **${query}**`,
            components: [row],
            ephemeral: true
        });
    })
    .build() as Command;
