import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Command } from "../../commands/Command";
import { searchGifs } from "../../applets/tenor";
import { logger } from "../../common/logger";

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
                if (CACHE.length === 0) {
                    CACHE = await searchGifs({ q: gifQuery, media_filter: "tinygif", limit: "50" });
                    logger.notice(`Populate Tenor cache for ${name}::${gifQuery}`)
                }

                // Randomize image result
                const idx = Math.floor(Math.random() * CACHE.length);
                const imageUrl = CACHE[idx];

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
