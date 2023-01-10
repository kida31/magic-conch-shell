const {SlashCommandBuilder} = require('discord.js');
const tenor = require('../plugins/tenor')
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    async execute(interaction) {
        await interaction.reply('Pong!' + interaction.user.toString());
    },
};
