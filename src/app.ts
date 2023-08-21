import { Client, Events, GatewayIntentBits } from "discord.js";
import { logger as parent } from "./common/logger";
import { ExtendedClient } from "./core/extended-client";

import * as dotenv from "dotenv";
import { DiscordPlayerLogger } from "./core/discord-player-responses";
import { CommandCollection } from "./commands";
import { getQuickRegistered } from "./core/command-decorator";
import { ActivityTemplates } from "./templates/discord-templates";
import { MusicRestService } from "./rest-service";


/** LOGGING */
const setupLogger = parent.child({ label: "Setup" })

/** ENVIRONMENT VARIABLES */
dotenv.config();

const { VERSION } = process.env;

const { TOKEN, DEV_TOKEN, DEV_PREFIX } = process.env;

const isDevMode = VERSION !== "LIVE";
if (isDevMode) {
    setupLogger.warning("Development environment. Using DEV settings");
}
const token = isDevMode ? DEV_TOKEN : TOKEN;

const PREFIX = (isDevMode ? DEV_PREFIX : "!!") ?? "+++";

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
            GatewayIntentBits.GuildPresences,
        ],
        prefix: PREFIX!,
    });

    // // Commands
    const commandHandler = client.commandHandler;
    commandHandler.registerCommand(...getQuickRegistered());
    // commandHandler.registerCommand(...CommandCollection.fromFolder("admin"));
    commandHandler.registerCommand(...CommandCollection.fromFolder("music"));
    // commandHandler.registerCommand(...CommandCollection.fromFolder("slash"));

    const musicInfo = new DiscordPlayerLogger(client);

    // Command deployment

    // Logging
    {
        const botLogger = parent.child({ label: "Client" })
        client.on(Events.ClientReady, (_c) => { botLogger.info(`The bot is online with ${commandHandler.commands.size} commands!`) });
        client.once(Events.ClientReady, (c) => {
            botLogger.info(`Ready! Logged in as ${c.user.tag}`);
            c.user.setActivity(...ActivityTemplates.Random(`${PREFIX}help`));
        });
        client.on(Events.Debug, (s) => { botLogger.debug(s) });
        client.on(Events.Warn, (s) => { botLogger.warning(s) });
        client.on(Events.Error, (e) => { botLogger.error(e.stack) });
        client.on(Events.InteractionCreate, (m) => { botLogger.debug(m) });
        client.on(Events.PresenceUpdate, (previousStatus, newstatus) => {
            // previousStatus?.status
        })
    }

    // Express
    {
        const restservice = new MusicRestService({
            player: client.musicPlayer,
            client: client
        });
        await restservice.start();
    }

    // Login
    if (!noLogin) {
        console.log("Logging in...")
        console.log(token);
        client.login(token);
    }

    return 0;
}

main();