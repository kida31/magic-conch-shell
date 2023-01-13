const music = require("../../services/music");
const {SlashCommandBuilder} = require("discord.js");
const RESPONSE = require('../../common/response')

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