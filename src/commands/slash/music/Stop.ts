import { MusicCommandBuilder } from "../../utils/CommandBuilder/MusicCommandBuilder";
import { MusicContext } from "../../applets/MusicContext";
import { PlayerMessage } from "../../../src/messages/GenericResponses";

export default new MusicCommandBuilder("stop", "Stop music player")
    .addFunction(async (interaction) => {
        const music = new MusicContext(interaction);
        if (music.isConnected) {
            await music.stop();
            await interaction.reply(PlayerMessage.STOPPED);
        } else {
            await interaction.reply(PlayerMessage.INVALID_OPERATION);
        }
    })
    .build();

