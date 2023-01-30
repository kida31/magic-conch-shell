import { MusicCommandBuilder } from "../../utils/CommandBuilder/MusicCommandBuilder";
import { MusicContext } from "../../applets/MusicContext";
import { PlayerMessage } from "../../../src/messages/GenericResponses";
import { EmbedBuilder } from "@discordjs/builders";

export default new MusicCommandBuilder("queue", "Show tracks in current queue")
    .addFunction(async (interaction) => {
        const music = new MusicContext(interaction);
        await interaction.reply(PlayerMessage.QUEUED_TRACKS(music.queue));
    })
    .build();

