import { Client, Events, GatewayIntentBits } from "discord.js";
import { Command } from "./commands/Command";
import { logger } from "./core/logger";
import { ExtendedPlayer } from "./music/music";
import * as dotenv from "dotenv";
import * as commandIndex from "./commands";

/** ENVIRONMENT VARIABLES */
dotenv.config();
const { TOKEN: token } = process.env;

/** PARSE CLI ARGUMENTS */
const argv = process.argv;
const noLogin = argv.includes("--dry");
const doDeploy = argv.includes("--deploy");

/** COMMANDS */
const commands: Map<string, Command> = new Map();
commandIndex.getAll().forEach(c => {
    commands.set(c.data.name, c)
});

/** CREATE CLIENT */
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
    ],
});

/** LOGGING */
client.once(Events.ClientReady, (c) => { logger.info(`Ready! Logged in as ${c.user.tag}`) });
client.on(Events.ClientReady, (_c) => { logger.info("The bot is online") });
client.on(Events.Debug, (s) => { logger.debug(s) });
client.on(Events.Warn, (s) => { logger.warning(s) });
client.on(Events.Error, (e) => { logger.error(e) });
client.on(Events.InteractionCreate, (m) => { logger.debug(m) });

/** SETUP MUSIC PLAYER */
ExtendedPlayer.initialize(client);

/** BOT BEHAVIOUR */
client.on(Events.InteractionCreate, async function handleInteraction(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = commands.get(interaction.commandName);

    if (!command) {
        logger.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        logger.error(error);
        await interaction.reply({
            content: "There was an error while executing this command!",
            ephemeral: true,
        });
    }
});

/** DEPLOY COMMANDS */
if (doDeploy) {
    (async () => {
        const { deployCommandArray } = await import("./deploy-commands");
        if (doDeploy) {
            deployCommandArray(Array.from(commands.values()).map(c => c.data.toJSON()))
            await logger.info("Deployed commands");
        }
    })()
}

if (!noLogin) {
    client.login(token);
}

