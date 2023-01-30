import { ButtonBuilder, ButtonInteraction, ButtonStyle, ComponentType, DiscordjsErrorCodes, InteractionCollector, InteractionReplyOptions, InteractionResponse, InteractionResponseType, StringSelectMenuInteraction } from "discord.js";
const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
import { QueryType, Track } from "discord-player";
import { MusicCommandBuilder } from "../../utils/CommandBuilder/MusicCommandBuilder";
import { Command } from "../Command";
import { logger } from "../../common/logger";
import { MusicContext } from "../../applets/MusicContext";
import { PlayerMessage } from "../../../src/messages/GenericResponses";

export default new MusicCommandBuilder("search", "search for music!")
    .addQueryOption()
    .addQueryTypeOption()
    .addFunction(async (interaction): Promise<void> => {
        if (!interaction.isChatInputCommand()) return;
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

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId("search-select")
            .setMinValues(0)
            .setMaxValues(trackOptions.length)
            .setPlaceholder("Select one or more songs")
            .addOptions(...trackOptions)

        const confirmButton = new ButtonBuilder()
            .setCustomId("search-confirm")
            .setStyle(ButtonStyle.Success)
            .setLabel("Add to Queue")
            .setEmoji("▶️");

        const addAllButton = new ButtonBuilder()
            .setCustomId("search-all")
            .setStyle(ButtonStyle.Primary)
            .setLabel("Add all")

        const cancelButton = new ButtonBuilder()
            .setCustomId("search-cancel")
            .setStyle(ButtonStyle.Secondary)
            .setLabel("Cancel")

        const selectMenuRow = new ActionRowBuilder().addComponents(selectMenu)
        const buttonRow = new ActionRowBuilder().addComponents(confirmButton, addAllButton, cancelButton);

        const replyOptions: InteractionReplyOptions = {
            content: `Found **${result.tracks.length}** results for **${query}**`,
            components: [selectMenuRow, buttonRow],
            ephemeral: true
        }

        const message = await interaction.reply(replyOptions);

        const disableInteraction = async () => {
            selectMenu.setDisabled(true);
            replyOptions.components = [selectMenuRow];
            await interaction.editReply(replyOptions);
        }

        // Refresh read values
        let selectedValues: string[];
        message.awaitMessageComponent({
            componentType: ComponentType.StringSelect,
            filter: async (i: StringSelectMenuInteraction) => {
                await i.deferUpdate();
                if (i.user.id == interaction.user.id && i.customId == 'search-select') selectedValues = i.values;
                return false
            },
            time: 15_000
        }).then(ignored => { }).catch(disableInteraction);

        // On Confirm or AddAll button
        message.awaitMessageComponent({
            filter: async (i: ButtonInteraction) => {
                await i.deferUpdate();
                return i.user.id == interaction.user.id;
            },
            componentType: ComponentType.Button,
            time: 15_000
        }).then(async response => {
            logger.info("Confirmed Interaction");
            disableInteraction();

            if (response.customId == "search-confirm") {
                const selectedTracks = selectedValues
                    .map(id => result.tracks.find(t => t.id == id))
                    .filter((t: Track | undefined): t is Track => !!t);
                ctx.addTracks(selectedTracks);
            } else if (response.customId == "search-all") {
                ctx.addTracks(result.tracks);
            }
        }).catch(err => {
            disableInteraction();

            if ("code" in err && err.code == DiscordjsErrorCodes.InteractionCollectorError) {
                logger.info({ message: "Interaction expired", id: interaction.id });
                return;
            }
            if (err instanceof Error) {
                logger.error(err.stack);
            }
        });
    })
    .build() as Command;
