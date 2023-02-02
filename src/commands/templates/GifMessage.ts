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
import { logger as parentLogger } from "../../common/Logger";
import { Command, CommandData } from "../Command";

const logger = parentLogger.child({ label: "GifCommandBuilder" });

type GifMessageOptions = {
    interaction: Interaction;
    gifQuery: string,
    message: string,
    mention?: User
}

export abstract class GifMessageCommand implements Command {
    abstract data: CommandData;
    abstract getParameters(interaction: Interaction<CacheType>): {
        query: string;
        message: string;
        target?: User;
    };
    async execute(interaction: Interaction<CacheType>) {
        if (!interaction.isRepliable()) return;

        const { message, query, target } = this.getParameters(interaction);
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
    data: CommandData = new SlashCommandBuilder(); // empty

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
    getParameters(interaction: Interaction<CacheType>): { query: string; message: string; target?: User | undefined; } {
        let target = interaction.isChatInputCommand() ? interaction.options.getUser("target", true) : undefined;

        const message = this.messageWithPlaceholder
            .replaceAll("ACTOR", interaction.user.username)
            .replaceAll("TARGET", target!.username);

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
    data: CommandData = new SlashCommandBuilder(); // empty

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

    getParameters(interaction: Interaction<CacheType>): { query: string; message: string; target?: User | undefined; } {
        let target = interaction.isUserContextMenuCommand() ? interaction.targetUser : undefined;

        const message = this.messageWithPlaceholder
            .replaceAll("ACTOR", interaction.user.toString())
            .replaceAll("TARGET", target!.toString());

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

export function buildExecute(commandOptions: { query: string; message: string, placeholder?: { actor?: string, target?: string } }) {
    return async function execute(interaction: Interaction) {
        const actor = interaction.user;

        // Try get target
        let target: User | null = null;
        if ("targetUser" in interaction) {
            target = interaction.targetUser;
        } else if ("options" in interaction && "getUser" in interaction.options) {
            target = interaction.options.getUser("target", true);
        } else {
            throw new Error("Could not resolve target");
        }

        // Apply message replacements
        if (commandOptions.placeholder?.actor) commandOptions.message = commandOptions.message.replaceAll(commandOptions.placeholder.actor, actor.username)
        if (commandOptions.placeholder?.target) commandOptions.message = commandOptions.message.replaceAll(commandOptions.placeholder.target, target.username)

        return await doSomethingToTarget({
            interaction: interaction,
            gifQuery: commandOptions.query,
            message: commandOptions.message,
            mention: target,
        });
    }
}
