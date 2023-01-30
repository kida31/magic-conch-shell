import { QueryType } from "discord-player";
import { MusicCommandBuilder } from "../../utils/CommandBuilder/MusicCommandBuilder";
import { Command } from "../Command";
import { MusicContext } from "../../applets/MusicContext";
import { PlayerMessage } from "../../../src/messages/GenericResponses";

export default new MusicCommandBuilder("resume", "Resume music playback")
    .addFunction(async (interaction) => {
        await interaction.deferReply({ ephemeral: true });
        const music = new MusicContext(interaction);
        await music.play();
    })
    .build() as Command;
