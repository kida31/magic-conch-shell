import * as discordPlayer from "discord-player";
import { QueryType } from "discord-player";
import {
    ActionRowBuilder, ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    CacheType,
    ComponentType,
    DiscordjsErrorCodes,
    Interaction,
    InteractionReplyOptions,
    SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuInteraction
} from "discord.js";
import { MusicContext } from "../../applets/MusicContext";
import { logger as parent, safeStringify } from "../../common/Logger";
import { PlayerMessage } from "../../messages/Music";
import { Command, CommandData, isCommand } from "../Command";

const logger = parent.child({ label: "command:music" });

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
    abstract getQuery(interaction: Interaction<CacheType>): string | null;
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

        if (!query) {
            await musicbot.play();
            await interaction.reply(PlayerMessage.CONFIRM_QUIET);
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


        const music = new MusicContext(interaction);
        await music.play();
        await interaction.reply(PlayerMessage.NOW_PLAYING(music.queue));
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

        await interaction.deferReply(
            // { ephemeral: true }
        );

        let result = await musicbot.search(query, queryType);

        if (result.tracks.length == 0) {
            await interaction.editReply(PlayerMessage.NO_RESULTS(query));
            return;
        }

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
            .addOptions(...trackOptions);

        const addAllButton = new ButtonBuilder()
            .setCustomId("search-all")
            .setStyle(ButtonStyle.Primary)
            .setLabel("Add all (" + trackOptions.length + ")");

        const cancelButton = new ButtonBuilder()
            .setCustomId("search-cancel")
            .setStyle(ButtonStyle.Secondary)
            .setLabel("Cancel");

        const selectMenuRow = new ActionRowBuilder<any>().addComponents(selectMenu);
        const buttonRow = new ActionRowBuilder().addComponents(addAllButton, cancelButton);

        const replyOptions: InteractionReplyOptions = {
            content: `Found **${result.tracks.length}** results for **${query}**`,
            components: [selectMenuRow, buttonRow],
        }

        const message = await interaction.editReply(replyOptions);

        message.awaitMessageComponent({
            filter: async (i) => {
                await i.deferUpdate();
                const isSelect = i.isStringSelectMenu() && i.customId == "search-select";
                const isButton = i.isButton() && (i.customId == "search-all" || i.customId == "search-cancel");
                if (isSelect || isButton) {
                    return i.user.id == interaction.user.id;
                }
                return false;
            },
            time: 60_000
        }).then(async (res) => {
            logger.info("Confirmed Interaction");
            await interaction.deleteReply();

            if (res.isStringSelectMenu()) {
                const selectedTracks = res.values
                    .map(id => result.tracks.find(t => t.id == id))
                    .filter((t: discordPlayer.Track | undefined): t is discordPlayer.Track => !!t);
                musicbot.addTracks(selectedTracks);
            } else if (res.customId == "search-all") {
                musicbot.addTracks(result.tracks);
            }
        }).catch(async (err: Error) => {
            if ("code" in err && err.code == DiscordjsErrorCodes.InteractionCollectorError) {
                logger.info({ message: "Interaction expired", id: interaction.id });
                return;
            }
            logger.warning(err.message);
            logger.error(err.stack ?? "", err);
        })
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
