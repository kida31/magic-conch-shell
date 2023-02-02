import * as discordPlayer from "discord-player";
import { QueryType } from "discord-player";
import {
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    CacheType,
    ComponentType,
    DiscordjsErrorCodes,
    Interaction,
    InteractionReplyOptions,
    SlashCommandBuilder,
    StringSelectMenuInteraction
} from "discord.js";
import { MusicContext } from "../../applets/MusicContext";
import { logger } from "../../common/Logger";
import { PlayerMessage } from "../../messages/Music";
import { Command, CommandData } from "../Command";

const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

export class DataBuilder {
    builder: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">

    constructor() {
        this.builder = new SlashCommandBuilder();
    }

    setName(name: string) {
        this.builder = this.builder.setName(name);
        return this;
    }

    setDescription(description: string) {
        this.builder = this.builder.setDescription(description);
        return this;
    }

    addQueryOption({ required = true }: { required?: boolean; } = {}) {
        if (!(this.builder instanceof SlashCommandBuilder)) throw new Error("Incompatible type " + typeof this.builder);
        this.builder = this.builder
            .addStringOption(option =>
                option
                    .setName('q')
                    .setDescription("url/query/search")
                    .setMaxLength(100)
                    .setRequired(required));
        return this;
    }

    addQueryTypeOption() {
        if (!(this.builder instanceof SlashCommandBuilder)) throw new Error("Incompatible type " + typeof this.builder);
        const queryTypes = Object.keys(QueryType).filter((item) => isNaN(Number(item)));
        const choices = queryTypes.map((t) => ({ name: t, value: t }));

        this.builder = this.builder
            .addStringOption(option =>
                option.setName('querytype')
                    .setDescription('discord-player:QueryType')
                    .addChoices(...choices));

        return this;
    }

    build(): CommandData {
        return this.builder;
    }
}

export abstract class PlayCommand implements Command {
    abstract data: CommandData;
    abstract getQuery(interaction: Interaction<CacheType>): string;
    abstract getQueryType(interaction: Interaction<CacheType>): string | any;


    async execute(interaction: Interaction<CacheType>): Promise<void> {
        if (!interaction.isCommand()) return;

        const query = this.getQuery(interaction);
        const querytype = this.getQueryType(interaction);

        const musicbot = new MusicContext(interaction);

        if (!await musicbot.joinChannel()) {
            await interaction.reply(PlayerMessage.USER_NOT_IN_VOICE);
            return;
        }

        const result = await musicbot.search(query, querytype);

        if (result.tracks.length > 0) {
            await musicbot.addTrack(result.tracks[0]);
            await interaction.reply(PlayerMessage.CONFIRM_QUIET);
        } else {
            await interaction.reply(PlayerMessage.NO_RESULTS(query));
        }
    }
}


export abstract class QueueCommand implements Command {
    abstract data: CommandData;

    async execute(interaction: Interaction<CacheType>): Promise<void> {
        if (!interaction.isCommand()) return;
        const music = new MusicContext(interaction);
        await interaction.reply(PlayerMessage.QUEUED_TRACKS(music.queue));
    }
}

export abstract class NowPlayingCommand implements Command {
    abstract data: CommandData;

    async execute(interaction: Interaction<CacheType>): Promise<void> {
        if (!interaction.isCommand()) return;

        const music = new MusicContext(interaction);
        if (!!music.nowPlaying) {
            await interaction.reply(PlayerMessage.NOW_PLAYING(music.queue));
        } else {
            await interaction.reply(PlayerMessage.QUEUE_EMPTY);
        }
    }
}

export abstract class ResumeCommand implements Command {
    abstract data: CommandData;

    async execute(interaction: Interaction<CacheType>): Promise<void> {
        if (!interaction.isCommand()) return;

        await interaction.deferReply({ ephemeral: true });
        const music = new MusicContext(interaction);
        await music.play();
    }
}

export abstract class SearchCommand implements Command {
    abstract data: CommandData;
    abstract getOptions(interaction: Interaction<CacheType>): { query: string, querytype?: string | QueryType }

    async execute(interaction: Interaction<CacheType>): Promise<void> {
        if (!interaction.isCommand()) return;
        const query: string = this.getOptions(interaction).query;
        const queryType: QueryType | string = this.getOptions(interaction).querytype ?? QueryType.YOUTUBE_SEARCH;

        let musicbot = new MusicContext(interaction);

        if (!await musicbot.joinChannel()) {
            await interaction.reply(PlayerMessage.USER_NOT_IN_VOICE);
            return;
        }

        let result = await musicbot.search(query, queryType);

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
                    .filter((t: discordPlayer.Track | undefined): t is discordPlayer.Track => !!t);
                musicbot.addTracks(selectedTracks);

            } else if (response.customId == "search-all") {
                musicbot.addTracks(result.tracks);
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
    }
}

export abstract class ShuffleCommand implements Command {
    abstract data: CommandData;

    async execute(interaction: Interaction<CacheType>): Promise<void> {
        if (!interaction.isCommand()) return;

        const music = new MusicContext(interaction);
        await music.shuffle();
        await interaction.reply(PlayerMessage.SHUFFLED);
    }
}

export abstract class SkipCommand implements Command {
    abstract data: CommandData;

    async execute(interaction: Interaction<CacheType>): Promise<void> {
        if (!interaction.isCommand()) return;

        const music = new MusicContext(interaction);
        await music.skip();
        await interaction.reply(PlayerMessage.SKIPPED);
    }
}

export abstract class StopCommand implements Command {
    abstract data: CommandData;

    async execute(interaction: Interaction<CacheType>): Promise<void> {
        if (!interaction.isCommand()) return;

        const music = new MusicContext(interaction);
        if (music.isConnected) {
            await music.stop();
            await interaction.reply(PlayerMessage.STOPPED);
        } else {
            await interaction.reply(PlayerMessage.INVALID_OPERATION);
        }
    }
}
