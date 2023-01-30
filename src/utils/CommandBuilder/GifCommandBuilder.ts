import { CacheType, EmbedBuilder, Interaction, InteractionReplyOptions, InteractionType, SlashCommandBuilder, User } from "discord.js";
import { Command } from "../../commands/Command";
import { quickRandomSearch } from "../../applets/Tenor/Tenor";
import { logger as parentLogger } from "../../common/logger";
import { SearchOptions } from "src/applets/Tenor/Types";

const logger = parentLogger.child({ label: "GifCommandBuilder" });

export class GifCommandBuilder {
    name: string
    description: string
    gifQuery: string
    embedDescription: string

    constructor() {
        this.name = "";
        this.description = "";
        this.gifQuery = "";
        this.embedDescription = "";
    }

    setName(name: string): GifCommandBuilder {
        this.name = name;
        return this;
    }


    setDescription(description: string): GifCommandBuilder {
        this.description = description;
        return this;
    }

    setGifQuery(gifQuery: string) {
        this.gifQuery = gifQuery;
        return this;
    }

    setEmbedDescription(embedDescription: string) {
        this.embedDescription = embedDescription;
        return this;
    }

    build(): Command {
        let CACHE: string[] = [];
        const name = this.name;
        const description = this.description;
        const gifQuery = this.gifQuery;
        const embedDescription = this.embedDescription;

        return {
            data: new SlashCommandBuilder()
                .setName(name)
                .setDescription(description)
                .addUserOption(option =>
                    option
                        .setName('target')
                        .setDescription(`Person to ${name}`)
                        .setRequired(true)),
            async execute(interaction) {
                // Randomize image result
                const imageUrl = await quickRandomSearch({ q: gifQuery }).then(img => img.url);

                const target = interaction.options.getUser('target');
                const embed = new EmbedBuilder()
                    .setImage(imageUrl)
                    .setDescription(
                        embedDescription
                            .replace("%s", `**${interaction.user.username}**`)
                            .replace("%s", `**${target!.username}**`))
                    .setFooter({ text: "Powered by Tenor" });

                await interaction.reply({
                    content: target!.toString(),
                    embeds: [embed]
                });
            }
        }
    }
}

type GifMessageOptions = {
    interaction: Interaction;
    gifQuery: string,
    message: string,
    mention?: User
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

interface SlashCommandBlueprint {
    name: string,
    description?: string
}

export function generateExecute(commandOptions: { query: string; message: string, placeholder?: { actor?: string, target?: string } }) {
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
