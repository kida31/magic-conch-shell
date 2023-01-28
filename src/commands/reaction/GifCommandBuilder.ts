import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Command } from "../Command";
import tenor from "../../common/GIF/tenor";

export class GifMessageBuilder {
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

    setName(name: string): GifMessageBuilder {
        this.name = name;
        return this;
    }


    setDescription(description: string): GifMessageBuilder {
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
                    const results = await tenor.search({ q: gifQuery, media_filter: "tinygif", limit: "50" });
                    CACHE = results.map(r => r['media_formats']['tinygif']['url']);
                    console.log(`Populate Tenor cache for ${name}::${gifQuery}`)
                }

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
