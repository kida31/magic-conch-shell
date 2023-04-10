import {
    ApplicationCommandType,
    CacheType,
    ContextMenuCommandBuilder,
    EmbedBuilder,
    Interaction,
    InteractionReplyOptions,
    SlashCommandBuilder,
    User
} from "discord.js";
import { quickRandomSearch } from "../../applets/Tenor/Tenor";
import { logger as parentLogger } from "../../common/logger";
import { Command } from "../command";

const logger = parentLogger.child({ label: "GifCommandBuilder" });

type GifMessageOptions = {
    interaction: Interaction;
    gifQuery: string,
    message: string,
    mention?: User
}

export abstract class GifMessageCommand implements Command {
    abstract data: any;
    abstract getParameters(interaction: Interaction<CacheType>): Promise<{
        query: string;
        message: string;
        target?: User;
    }>;
    async execute(interaction: Interaction<CacheType>) {
        if (!interaction.isRepliable()) return;

        const { message, query, target } = await this.getParameters(interaction);
        const image = await quickRandomSearch({ q: query });
        const embed = new EmbedBuilder()
            .setImage(image.url)
            .setFooter({ text: "Powered by Tenor", iconURL: "https://tenor.com/assets/img/tenor-logo.svg" });

        if (message && message != "") embed.setDescription(message);

        const r: InteractionReplyOptions = { embeds: [embed] };
        if (target) r.content = target.toString();

        await interaction.reply(r);
    }
}

export class SlashGifMessageCommand extends GifMessageCommand {
    messageWithPlaceholder: string;
    query: string;
    data: any = new SlashCommandBuilder(); // empty

    /** Message with ACTOR as placeholder for active user and TARGET for placeholder for target */
    constructor(options: {
        name: string,
        description: string,
        query: string,
        messageWithPlaceholder: string
    }) {
        super();
        const { name, description, query, messageWithPlaceholder } = options;

        this.messageWithPlaceholder = messageWithPlaceholder;
        this.query = query;

        this.data = new SlashCommandBuilder()
            .setName(name)
            .setDescription(description)
            .addUserOption(option =>
                option
                    .setName('target')
                    .setDescription(`Recipient of the message`)
                    .setRequired(true));

    }
    async getParameters(interaction: Interaction<CacheType>): Promise<{ query: string; message: string; target?: User | undefined; }> {
        if (!interaction.isChatInputCommand()) throw new Error("Unexpected interaction type");

        const user = interaction.user;
        const target = interaction.options.getUser("target", true);

        const gActor = await interaction.guild?.members.fetch(user.id)
        const gTarget = await interaction.guild?.members.fetch(target.id);

        const message = this.messageWithPlaceholder
            .replaceAll("ACTOR", gActor?.displayName ?? user.toString())
            .replaceAll("TARGET", gTarget?.displayName ?? target.toString());

        return {
            query: this.query,
            message: message,
            target: target
        }
    }
}

export class UserContextMenuGifMessageCommand extends GifMessageCommand {
    messageWithPlaceholder: string;
    query: string;
    data: any = new SlashCommandBuilder(); // empty

    /** Message with ACTOR as placeholder for active user and TARGET for placeholder for target */
    constructor(options: {
        name: string,
        query: string,
        messageWithPlaceholder: string
    }) {
        super();
        const { name, query, messageWithPlaceholder } = options;

        this.messageWithPlaceholder = messageWithPlaceholder;
        this.query = query;

        this.data = new ContextMenuCommandBuilder()
            .setName(name)
            .setType(ApplicationCommandType.User);
    }

    async getParameters(interaction: Interaction<CacheType>): Promise<{ query: string; message: string; target?: User | undefined; }> {
        if (!interaction.isUserContextMenuCommand()) throw new Error("Unexpected Interaction type");

        const target = interaction.targetUser;
        const user = interaction.user;

        const gActor = await interaction.guild?.members.fetch(user.id)
        const gTarget = await interaction.guild?.members.fetch(target.id);

        const message = this.messageWithPlaceholder
            .replaceAll("ACTOR", gActor?.displayName ?? user.toString())
            .replaceAll("TARGET", gTarget?.displayName ?? target.toString());


        return {
            query: this.query,
            message: message,
            target: target
        }
    }
}

export async function doSomethingToTarget(options: GifMessageOptions) {
    logger.notice("DoSomething", options);

    const { interaction, gifQuery, message } = options;
    const { mention } = options;

    const image = await quickRandomSearch({ q: gifQuery });
    const embed = new EmbedBuilder()
        .setImage(image.url)
        .setDescription(message)
        .setFooter({ text: "Powered by Tenor", iconURL: "https://tenor.com/assets/img/tenor-logo.svg" });

    const reply: InteractionReplyOptions = { embeds: [embed] }
    if (mention) reply.content = mention.toString();

    if (!interaction.isRepliable()) throw new Error("Unexpected InteractionType" + interaction.type);

    await interaction.reply(reply);
}
