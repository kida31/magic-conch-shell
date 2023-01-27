import music from "../../services/music";

import {SlashCommandBuilder} from "discord.js";

import RESPONSE from "../../common/response";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip the current song'),
    async execute(interaction) {
        // arrange
        const player = music.getPlayer();

        // act
        let queue = await player.getQueue(interaction.guild);
        if (!queue) {
            queue = await player.createQueue(interaction.guild);
        }
        await queue.skip();

        // reply
        await interaction.reply(RESPONSE.QUIET_CONFIRM);
    }
}