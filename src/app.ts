import { Events, GatewayIntentBits } from "discord.js";
import { logger as parent } from "./common/logger";
import { ExtendedClient } from "./core/extended-client";

import * as dotenv from "dotenv";
import { CommandHandler } from "./core/command-handler";
import { DiscordPlayerLogger } from "./core/music-player-logger";


/** LOGGING */
const setupLogger = parent.child({ label: "Setup" })

/** ENVIRONMENT VARIABLES */
dotenv.config();
const { TOKEN: token } = process.env;

const PREFIX = "!!";

async function main(): Promise<number> {
    /** PARSE CLI ARGUMENTS */
    const argv: string[] = process.argv;
    const noLogin: boolean = argv.includes("--dry");
    const doDeploy: boolean = argv.includes("--deploy");

    // Create client
    const client = new ExtendedClient({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
        ],
    });

    // Commands
    const commandHandler = new CommandHandler(client, { prefix: PREFIX });
    const musicInfo = new DiscordPlayerLogger(client);

    // Command deployment

    // Logging
    {
        const botLogger = parent.child({ label: "Client" })
        client.on(Events.ClientReady, (_c) => { botLogger.info(`The bot is online with ${commandHandler.commands.size} commands!`) });
        client.once(Events.ClientReady, (c) => { botLogger.info(`Ready! Logged in as ${c.user.tag}`) });
        client.on(Events.Debug, (s) => { botLogger.debug(s) });
        client.on(Events.Warn, (s) => { botLogger.warning(s) });
        client.on(Events.Error, (e) => { botLogger.error(e.stack) });
        client.on(Events.InteractionCreate, (m) => { botLogger.debug(m) });
    }

    // Login
    if (!noLogin) {
        client.login(token);
    }

    return 0;
}



main();