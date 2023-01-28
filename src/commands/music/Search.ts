import { ComponentType, StringSelectMenuInteraction } from "discord.js";
const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
import { QueryType, Track } from "discord-player";
import { MusicCommandBuilder } from "../../utils/CommandBuilder/MusicCommandBuilder";
import { Command } from "../Command";
import { logger } from "../../common/logger";
import { MusicContext } from "../../applets/MusicContext";
import MenuInteractionHandler from "../../menuinteractions/MenuInteractionHandler";
import { resolveSoa } from "node:dns";
import { PlayerResponses } from "../../../src/messages/GenericResponses";

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

        const selectionComponent = new StringSelectMenuBuilder()
            .setCustomId(customId)
            .setMinValues(0)
            .setMaxValues(trackOptions.length)
            .setPlaceholder("Choose a song")
            .addOptions(...trackOptions)

        const singleRow = new ActionRowBuilder().addComponents(selectionComponent);

        const message = await interaction.reply({
            content: `Found **${result.tracks.length}** results for **${query}**`,
            components: [singleRow],
            ephemeral: true
        });

        const filter = async (i: StringSelectMenuInteraction) => {
            if (i.customId == customId) {
                return true;
            }
            await i.deferUpdate();
            return false;
        }
        message.awaitMessageComponent({ filter, componentType: ComponentType.StringSelect, time: 15_000 })
            .then(async response => {
                logger.warning(response.isRepliable());
                await response.reply({ content: response.values.join(", "), ephemeral: true });
                logger.notice(response);
                const selected: Track[] = response.values
                    .map(id => result.tracks.find(t => t.id == id))
                    .filter((t: Track | undefined): t is Track => !!t);

            })
            .catch(err => logger.error((err as Error).stack));
    })
    .build() as Command;
