import { Player } from "discord-player";
import { CacheType, Client, DMChannel, Events, GatewayIntentBits, GuildMember, Interaction, Message, StageChannel, VoiceBasedChannel } from "discord.js";
import { conch } from "./applets/open-ai/MagicConchShell";
import { deployData } from "./deployment";
import { CommandCollection } from "./commands";
import { Command } from "./commands/command";
import { logger as parent } from "./common/logger";
import { GenericReply } from "./messages/Common";
import { ExtendedClient } from "./core/extended-client";
import { DiscordPlayer, MusicCommand } from "./logic/music";
import { CustomAIBot, SillyChatBot, MagicEightBall } from "./applets/open-ai/chatbot";

import * as dotenv from "dotenv";


/** LOGGING */
const setupLogger = parent.child({ label: "Setup" })

/** ENVIRONMENT VARIABLES */
dotenv.config();
const { TOKEN: token } = process.env;

const PREFIX = "+";

async function main(): Promise<number> {
    /** PARSE CLI ARGUMENTS */
    const argv: string[] = process.argv;
    const noLogin: boolean = argv.includes("--dry");
    const doDeploy: boolean = argv.includes("--deploy");

    /** CREATE CLIENT */
    const client = new ExtendedClient({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
        ],
    });

    client.commands = await loadCommands();
    addClientLogger(client);
    addMusicListener(client);
    addEventListeners(client);

    /** DEPLOY COMMANDS */
    if (doDeploy) {
        (async () => {
            if (doDeploy) {
                setupLogger.info("Deployed commands");
            }
        })()
    }

    if (!noLogin) {
        client.login(token);
    }

    return 0;
}

async function loadCommands() {
    const commandSetupLogger = setupLogger.child({ "label": "Setup:Commands" })

    const commands = {
        slash: new Map<string, Command>(),
        context: new Map<string, Command>(),
        get size(): number {
            return this.slash.size + this.context.size;
        }
    }

    CommandCollection.getAllSlashCommands().forEach((cmd, idx) => {
        // if (cmd.data.name in commands.slash) commandSetupLogger.warning("DUPLICATE COMMAND")
        // commands.slash.set(cmd.data.name, cmd);
        // commandSetupLogger.notice(`Registered #${idx} (/)${cmd.data.name}`);
    });

    CommandCollection.getAllUserContextMenuCommands().forEach((cmd, idx) => {
        // if (cmd.data.name in commands.context) commandSetupLogger.warning("DUPLICATE COMMAND")
        // commands.context.set(cmd.data.name, cmd);
        // commandSetupLogger.notice(`Registered #${idx} (App>)${cmd.data.name}`);
    })

    return commands;
}

function addClientLogger(client: ExtendedClient) {
    const botLogger = parent.child({ label: "Client" })

    client.on(Events.ClientReady, (_c) => { botLogger.info(`The bot is online with ${client.commands.size} commands!`) });
    client.once(Events.ClientReady, (c) => { botLogger.info(`Ready! Logged in as ${c.user.tag}`) });
    client.on(Events.Debug, (s) => { botLogger.debug(s) });
    client.on(Events.Warn, (s) => { botLogger.warning(s) });
    client.on(Events.Error, (e) => { botLogger.error(e.stack) });
    client.on(Events.InteractionCreate, (m) => { botLogger.debug(m) });
}

function addMusicListener(client: ExtendedClient) {
    const logger = parent.child({ label: "Music" });
    const player = client.player;
    player.eventNames().forEach(eventType =>{
        console.log(eventType);
        const childLogger = logger.child({ label:eventType.toString()});
        player.on(eventType, (event: any) => {
            childLogger.log(event);
        })
    })

    setupLogger.info("Added listeners to music events");
}

function addEventListeners(client: ExtendedClient) {
    /** LOGGING */
    const eventLogger = parent.child({ label: "Event" })

    /** BOT BEHAVIOUR */
    client.on(Events.InteractionCreate, async (interaction) => {
        let command: Command | undefined;

        if (interaction.isChatInputCommand()) {
            command = client.commands.slash.get(interaction.commandName);
        } else if (interaction.isUserContextMenuCommand()) {
            command = client.commands.context.get(interaction.commandName);
        } else {
            return;
        }

        if (!command) {
            eventLogger.warning(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            await command.execute(interaction);
            meta.status = "Complete";
        } catch (error) {
            if (error instanceof Error) {
                eventLogger.warning(error.message);
                eventLogger.error(error.stack ?? "", error);
            }


            await interaction.reply({
                content: "There was an error while executing this command!",
                ephemeral: true,
            });
        } finally {
            eventLogger.debug("New chat interaction", meta);
        }
    });



    client.on('messageCreate', async (message) => {
        if (message.author.id == message.client.user.id) return;

        eventLogger.log("trace", "Observed a message: " + message.content.substring(0, 30) + "...");

        if (message.content.startsWith(PREFIX)) {
            const music: MusicCommand = new DiscordPlayer(message);
            const channel: VoiceBasedChannel = message.member?.voice.channel!;

            message.content = message.content.substring(1);
            const removeIfStarts = (compare: string) => {
                if (message.content.startsWith(compare)) {
                    message.content = message.content.replace(compare, "");
                    return true;
                }
                return false;
            }

            const formatSong = (s: any) => `${s.title} - ${s.author} (${s.duration})`

            if (removeIfStarts("play")) {
                await music.play(channel, message.content);
            } else if (removeIfStarts("skip")) {
                await music.skipSong();
            } else if (removeIfStarts("stop")) {
                await music.stop();
            } else if (removeIfStarts("queue")) {
                const current = await music.getCurrentSong();
                const songs = (await music.getQueue()).map((s, i) => `${i + 1}. ${formatSong(s)}`).join("\n");
                message.reply("Now playing: " + formatSong(current) + "\nQueue:\n" + songs);
            } else if (removeIfStarts("nowplaying")) {
                const current = await music.getCurrentSong();
                message.reply("Now playing: " + formatSong(current));
            }

            return;
        }

        if (message.mentions.has(message.client.user)) {
            if (message.content.length > 500) {
                await message.reply(GenericReply.WARNING);
                return;
            }
            eventLogger.debug("Someone mentioned the bot", message.content);
            if (!(message.channel instanceof StageChannel)) await message.channel.sendTyping();
            const res = await CustomAIBot.chat(message.cleanContent, message.author.username) ?? "Ask me again.";
            await message.reply(res);
            eventLogger.info("Bot Message:", res)
            return;
        }

        // CustomAIBot.read(message.content);
    })

    setupLogger.info("Added listeners to discord events");
}


main();