import { QueryType } from "discord-player";
import { CacheType, Interaction } from "discord.js";
import { DataBuilder, PlayCommand } from "../../templates/Music";


class SlashPlayCommand extends PlayCommand {
    data = new DataBuilder()
        .setName("play")
        .setDescription("Play some music")
        .addQueryOption({ required: false })
        .addQueryTypeOption()
        .build();

    getQuery(interaction: Interaction<CacheType>): string | null {
        if (!interaction.isChatInputCommand()) return "";
        return interaction.options.getString("q");
    }

    getQueryType(interaction: Interaction<CacheType>) {
        if (!interaction.isChatInputCommand()) return "";
        return interaction.options.getString("querytype") ?? QueryType.YOUTUBE_SEARCH;
    }
}

export default new SlashPlayCommand();
