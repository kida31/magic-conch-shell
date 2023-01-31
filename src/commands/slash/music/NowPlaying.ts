import { MusicCommandBuilder } from "../../utils/CommandBuilder/MusicCommandBuilder";
import { MusicContext } from "../../applets/MusicContext";
import { PlayerMessage } from "../../../src/messages/GenericResponses";

export default new MusicCommandBuilder("nowplaying", "Show currently played track")
    .addFunction(async (interaction) => {
        const music = new MusicContext(interaction);
        if (!!music.nowPlaying) {
            await interaction.reply(PlayerMessage.NOW_PLAYING(music.queue));
        } else {
            await interaction.reply(PlayerMessage.QUEUE_EMPTY);
        }
    })
    .build();
