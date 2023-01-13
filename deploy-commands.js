const {REST, Routes} = require('discord.js');
require('dotenv').config();
const {CLIENT_ID: clientId, GUILD_ID: guildId, TOKEN: token} = process.env;
const fs = require('node:fs');

async function deploy(commandList) {
    const rest = new REST({version: '10'}).setToken(token);

    await (async () => {
        try {
            console.log(`Started refreshing ${commandList.length} application (/) commands.`);

            // The put method is used to fully refresh all commands in the guild with the current set
            const data = await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                {
                    body: commandList
                },
            );

            console.log(`Successfully reloaded ${data.length} application (/) commands.`);
        } catch (error) {
            // And of course, make sure you catch and log any errors!
            console.error(error);
        }
    })();
}


/** Original script */
function main() {
    const commands = [];
// Grab all the command files from the commands directory you created earlier
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        commands.push(command.data.toJSON());
    }

// Construct and prepare an instance of the REST module
    const rest = new REST({version: '10'}).setToken(token);

// and deploy your commands!
    (async () => {
        try {
            console.log(`Started refreshing ${commands.length} application (/) commands.`);

            // The put method is used to fully refresh all commands in the guild with the current set
            const data = await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                {
                    body: commands
                },
            );

            console.log(`Successfully reloaded ${data.length} application (/) commands.`);
        } catch (error) {
            // And of course, make sure you catch and log any errors!
            console.error(error);
        }
    })();
}

module.exports = {
    deploy,
    main
}