const { Client, Events, GatewayIntentBits, IntentsBitField, } = await import("discord.js");
import { config } from "https://deno.land/x/dotenv@v3.2.0/mod.ts";
import { Command } from "./commands/command.ts";
import { debugLogger as logger } from "./common/logger.ts";
import { ExtendedPlayer } from "./music/music.ts";

/** ENVIRONMENT VARIABLES */
const { TOKEN: token } = config();

/** PARSE CLI ARGUMENTS */
const argv = Deno.args;
const noLogin = argv.includes("--nologin");
const doDeploy = argv.includes("--deploy");

/** COMMANDS */
import * as cmdIndex from "./commands/index.ts";
const commands: Map<string, Command> = new Map(Object.entries(cmdIndex));

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
    const { deployCommandArray } = await import("./deploy-commands.js");
    if (doDeploy) {
        await deployCommandArray(Array.from(commands.values()).map(c => c.data.toJSON()));
        logger.info("Deployed commands");
    }
}

if (!noLogin) {
    client.login(token);
}

