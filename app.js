const fs = require('node:fs');
const path = require('node:path');
const {Client, Collection, Events, GatewayIntentBits, IntentsBitField} = require('discord.js');
const {Player} = require("discord-player");
const {iterateDepth} = require('./fileutil.js')

require('dotenv').config();
const {TOKEN: token, CLIENT_ID: clientId, GUILD_ID: guildId} = process.env;
require('./plugins/giphy').setKey(process.env.GIPHY_API_KEY)
require('./plugins/tenor').setup(process.env.TENOR_API)

/** PARSE CL ARGUMENTS */
console.log(process.argv)
const stayOffline = process.argv.includes("--offline")
const deployCommands = process.argv.includes("--deploy")


/** CREATE CLIENT INSTANCE */
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages
    ]
});


/** REGISTER COMMANDS */
client.commands = new Collection();
iterateDepth(path.join(__dirname, 'commands'), (filePath) => {
    if (!filePath.endsWith('.js')) return;

    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        console.log(`[INFO] Add ${command.data.name}`)
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
})


/** SETUP MUSIC PLAYER */
const music = require('./services/music')
music.config(client);


/** OnReady */
// When the client is ready, run this code (only once)
client.once(Events.ClientReady, c => {
    const {deploy} = require('./deploy-commands')
    if (deployCommands) {
        deploy(client.commands.map(c => c.data.toJSON())).then(r => "Deploy completed")
    }
    console.log(`Ready! Logged in as ${c.user.tag}`);
});

/** OnInteraction */
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
    }
});

if (stayOffline) {
    return;
}

/** Login/Run */
client.login(token);