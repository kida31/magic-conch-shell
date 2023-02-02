import { Queue, StreamDispatcher } from "discord-player";
import { Client, Events, GatewayIntentBits, GuildMember } from "discord.js";
import * as dotenv from "dotenv";
import { MusicContext } from "./applets/MusicContext";
import { conch } from "./applets/OpenAI/MagicConchShell";
import { deployData } from "./CommandDeployer";
import { CommandCollection } from "./commands";
import { Command, SlashCommand, UserContextMenuCommand } from "./commands/Command";
import { logger as parent } from "./common/Logger";
import { GenericReply } from "./messages/Common";
import { PlayerMessage } from "./messages/Music";

/** LOGGING */
const logger = parent.child({ label: "App" })

/** ENVIRONMENT VARIABLES */
dotenv.config();
const { TOKEN: token } = process.env;

/** PARSE CLI ARGUMENTS */
const argv = process.argv;
const noLogin = argv.includes("--dry");
const doDeploy = argv.includes("--deploy");

/** COMMANDS */
const commands = {
    slash: new Map<string, SlashCommand>(),
    context: new Map<string, UserContextMenuCommand>(),
    get size(): number {
        return this.slash.size + this.context.size;
    }
}

{
    CommandCollection.getAllSlashCommands().forEach((cmd, idx) => {
        if (cmd.data.name in commands.slash) logger.warning("DUPLICATE COMMAND")
        commands.slash.set(cmd.data.name, cmd);
        logger.notice(`Registered #${idx} (/)${cmd.data.name}`);
    });

    CommandCollection.getAllUserContextMenuCommands().forEach((cmd, idx) => {
        if (cmd.data.name in commands.context) logger.warning("DUPLICATE COMMAND")
        commands.context.set(cmd.data.name, cmd);
        logger.notice(`Registered #${idx} (App>)${cmd.data.name}`);
    })
}

/** CREATE CLIENT */
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});


/** LOGGING */
client.on(Events.ClientReady, (_c) => { logger.info(`The bot is online with ${commands.size} commands!`) });
client.once(Events.ClientReady, (c) => { logger.info(`Ready! Logged in as ${c.user.tag}`) });
client.on(Events.Debug, (s) => { logger.debug(s) });
client.on(Events.Warn, (s) => { logger.warning(s) });
client.on(Events.Error, (e) => { logger.error(e.stack) });
client.on(Events.InteractionCreate, (m) => { logger.debug(m) });


/** SET UP SERVICES  && Logging*/
{
    MusicContext.config(client);
    let musicLogger = logger.child({ label: "MusicContext" });

    MusicContext.player.addListener("connectionCreate", (queue: Queue, connection: StreamDispatcher) => { musicLogger.notice("Connected to voice channel", { guild: { name: queue.guild.name, id: queue.guild.id }, voice: { name: connection.channel.name } }) });
    MusicContext.player.addListener("botDisconnect", (queue) => {
        musicLogger.notice("Disconnected from voice channel", { guild: { name: queue.guild.name, id: queue.guild.id } })
        MusicContext.getTextChannel(queue)?.send(PlayerMessage.STOPPED);
    });
    MusicContext.player.addListener("debug", (queue, message) => { musicLogger.debug(message, { guild: { name: queue.guild.name, id: queue.guild.id } }) });
    MusicContext.player.addListener("error", (queue, err) => { musicLogger.error("General Error", { guild: { name: queue.guild.name, id: queue.guild.id }, err }); });
    MusicContext.player.addListener("connectionError", (queue, err) => { musicLogger.error("Connection Error", { guild: { name: queue.guild.name, id: queue.guild.id }, err }); })

    MusicContext.player.addListener("queueEnd", (queue: Queue) => {
        musicLogger.info("No more tracks in queue", { guild: { name: queue.guild.name, id: queue.guild.id } });
        MusicContext.getTextChannel(queue)?.send(PlayerMessage.QUEUE_EMPTY);
    });
    MusicContext.player.addListener("trackAdd", (queue, track) => {
        musicLogger.info("Added track to queue", { guild: { name: queue.guild.name, id: queue.guild.id }, track });
        MusicContext.getTextChannel(queue)?.send(PlayerMessage.ADDED_TRACK(track));
    });
    MusicContext.player.addListener("tracksAdd", (queue, tracks) => {
        musicLogger.info("Added multiple tracks", { tracks: tracks.map(t => ({ title: t.title, author: t.author, requestedBy: t.requestedBy, duration: t.duration })) })
        MusicContext.getTextChannel(queue)?.send(PlayerMessage.ADDED_TRACKS(tracks));
    });
    MusicContext.player.addListener("trackEnd", (queue, track) => {
        musicLogger.info("Track playback ended", { track: { title: track.title, author: track.author, requestedBy: track.requestedBy, duration: track.duration } });
    });
    MusicContext.player.addListener("trackStart", (queue, track) => {
        musicLogger.info("Track playback started", { track: { title: track.title, author: track.author, requestedBy: track.requestedBy, duration: track.duration } });
        MusicContext.getTextChannel(queue)?.send(PlayerMessage.NOW_PLAYING(queue));
    });
}

/** BOT BEHAVIOUR */
client.on(Events.InteractionCreate, async (interaction) => {
    let command: Command | undefined;

    if (interaction.isChatInputCommand()) {
        command = commands.slash.get(interaction.commandName);
    } else if (interaction.isUserContextMenuCommand()) {
        command = commands.context.get(interaction.commandName);
    } else {
        return;
    }


    if (!command) {
        logger.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    const meta = {
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
        meta.status = "Complete";
    } catch (error) {
        logger.error(error instanceof Error ? error.stack : "App.ts Error");

        await interaction.reply({
            content: "There was an error while executing this command!",
            ephemeral: true,
        });
    } finally {
        logger.debug("New chat interaction", meta);
    }
});

client.on('messageCreate', async (message) => {
    if (message.content.length > 500) {
        await message.reply(GenericReply.WARNING);
        return;
    }
    if (message.author.id == message.client.user.id) return;
    logger.log("trace", "Observed a message: " + message.content.substring(0, 30) + "...")
    if (!message.mentions.has(message.client.user)) return;

    logger.debug("Someone mentioned the bot", message.content);
    await message.channel.sendTyping();
    const res = await conch.ask(message);
    const newMessage = { content: res == "" ? "Ask me later." : res };
    logger.info("Bot Message:", newMessage)
    await message.reply(newMessage);

})

/** DEPLOY COMMANDS */
if (doDeploy) {
    (async () => {
        if (doDeploy) {
            await deployData(CommandCollection.getAllJson())
            logger.info("Deployed commands");
        }
    })()
}

if (!noLogin) {
    client.login(token);
}

