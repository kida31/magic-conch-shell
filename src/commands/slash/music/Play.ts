import { QueryType } from "discord-player";
import { MusicCommandBuilder } from "../../utils/CommandBuilder/MusicCommandBuilder";
import { Command } from "../Command";
import { MusicContext } from "../../applets/MusicContext";
import { PlayerMessage } from "../../../src/messages/GenericResponses";

export default new MusicCommandBuilder("play", "Play some music")
    .addQueryOption()
    .addQueryTypeOption()
    .addFunction(async (interaction) => {
        if (!interaction.isChatInputCommand()) return;
        const query = interaction.options.getString("q")!;
        const querytype = interaction.options.getString("querytype") ?? QueryType.YOUTUBE_SEARCH;

        const music = new MusicContext(interaction);

        if (!await music.joinChannel()) {
            await interaction.reply(PlayerMessage.USER_NOT_IN_VOICE);
            return;
        }

        const result = await music.search(query, querytype);

        if (result.tracks.length > 0) {
            await music.addTrack(result.tracks[0]);
            // await interaction.reply(PlayerMessage.ADDED_TRACK(result.tracks[0]));
            await interaction.reply(PlayerMessage.CONFIRM_QUIET);
        } else {
            // await interaction.reply(PlayerMessage.NO_RESULTS(query));
        }
    })
    .build() as Command;
