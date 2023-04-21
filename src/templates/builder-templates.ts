import {
    ContextMenuCommandBuilder,
    EmbedBuilder,
    RESTPostAPIChatInputApplicationCommandsJSONBody,
    SlashCommandBuilder
} from "discord.js";
import { UserContextMenuGifMessageCommand } from "../commands/templates/GifMessage";
import {quickRandomSearch} from "../external/tenor/tenor";

class CommandDataTemplates {
    getSimpleSlash(name: string, description?: string):  SlashCommandBuilder {
        return new SlashCommandBuilder()
            .setName(name)
            .setDescription(description ?? `${name}-command`);
    }

    getSimpleContextMenu(name: string, description?: string): ContextMenuCommandBuilder {
        return new ContextMenuCommandBuilder().setName(name);
    }
}

export class EmbedTemplates {
    static async getGifEmbed(text: string, gifQuery: string): Promise<EmbedBuilder> {
        const image = await quickRandomSearch({ q: gifQuery });

        return new EmbedBuilder()
            .setDescription(text)
            .setImage(image.url)
            .setFooter({ text: "Powered by Tenor", iconURL: "https://tenor.com/assets/img/tenor-logo.svg" });
    }
}