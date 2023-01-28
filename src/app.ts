import { Client, Events, GatewayIntentBits, GuildMember } from "discord.js";
import { Command } from "./commands/Command";
import { logger } from "./common/logger";
import * as dotenv from "dotenv";
import * as CommandFolder from "./commands";
import { MusicContext } from "./applets/MusicContext";
import { Track } from "discord-player";
import MenuInteractionHandler from "./menuinteractions/MenuInteractionHandler";

/** ENVIRONMENT VARIABLES */
dotenv.config();
const { TOKEN: token } = process.env;

/** PARSE CLI ARGUMENTS */
const argv = process.argv;
const noLogin = argv.includes("--dry");
const doDeploy = argv.includes("--deploy");

/** COMMANDS */
const commands: Map<string, Command> = new Map();
CommandFolder.getAll().forEach(c => {
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
client.once(Events.ClientReady, (c) => { logger.info(`Ready! Logged in as ${c.user.tag}\n`) });
client.on(Events.ClientReady, (_c) => { logger.info(`The bot is online with ${CommandFolder.getAll().length} commands!`) });
client.on(Events.Debug, (s) => { logger.debug(s) });
client.on(Events.Warn, (s) => { logger.warning(s) });
client.on(Events.Error, (e) => { logger.error(e.stack) });
client.on(Events.InteractionCreate, (m) => { logger.debug(m) });

/** SET UP SERVICES */
MusicContext.config(client);

/** BOT BEHAVIOUR */
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand())
        return;

    const command = commands.get(interaction.commandName);

    if (!command) {
        logger.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    const msg = {
        commandName: interaction.commandName,
        guildId: interaction.guildId,
        member: {
            displayName: (interaction.member as GuildMember).displayName,
            userId: (interaction.user.id)
        },
        status: "Pending"
    };
    try {
        await command.execute(interaction);
        msg.status = "Complete";
    } catch (error) {
        logger.error(error instanceof Error ? error.stack : "App.ts Error");

        await interaction.reply({
            content: "There was an error while executing this command!",
            ephemeral: true,
        });
    } finally {
        logger.info(JSON.stringify(msg));
    }
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isStringSelectMenu()) return;
    MenuInteractionHandler.resolveInteraction(interaction);
})

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

