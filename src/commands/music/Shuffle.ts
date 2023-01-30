import { MusicCommandBuilder } from "../../utils/CommandBuilder/MusicCommandBuilder";
import { MusicContext } from "../../applets/MusicContext";
import { PlayerMessage } from "../../../src/messages/GenericResponses";

export default new MusicCommandBuilder("shuffle", "Shuffle all queued songs")
    .addFunction(async (interaction) => {
        const music = new MusicContext(interaction);
        await music.skip();
        await interaction.reply(PlayerMessage.SHUFFLED);
    })
    .build();

