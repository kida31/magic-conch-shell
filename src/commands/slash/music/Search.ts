import { CacheType, Interaction } from "discord.js";
import { QueryType } from "discord-player";
import { CommandData } from "../../command";
import { DataBuilder, SearchCommand } from "../../templates/Music";


class SlashSearchCommand extends SearchCommand {
    data: CommandData = new DataBuilder()
        .setName("search")
        .setDescription("Search for music!")
        .addQueryOption({ required: true })
        .addQueryTypeOption()
        .build();

    getOptions(interaction: Interaction<CacheType>): { query: string; querytype?: string | QueryType | undefined; } {
        if (!interaction.isChatInputCommand()) throw new Error("Not a chat input command")

        return {
            query: interaction.options.getString("q", true),
            querytype: interaction.options.getString("querytype") ?? undefined
        }
    }
}

export default new SlashSearchCommand();
