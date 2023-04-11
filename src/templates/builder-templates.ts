import { ContextMenuCommandBuilder, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder } from "discord.js";
import { UserContextMenuGifMessageCommand } from "../commands/templates/GifMessage";

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