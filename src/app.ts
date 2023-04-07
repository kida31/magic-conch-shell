import { Player } from "discord-player";
import {CacheType, Client, DMChannel, Events, GatewayIntentBits, GuildMember, Interaction, Message} from "discord.js";
import * as dotenv from "dotenv";
import { conch } from "./applets/OpenAI/MagicConchShell";
import { deployData } from "./deployment";
import { CommandCollection } from "./commands";
import { Command, SlashCommand, UserContextMenuCommand } from "./commands/command";
import { logger as parent } from "./common/logger";
import { GenericReply } from "./messages/Common";

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

const player = new Player(client);

player.events.on('playerStart', (queue, track) => {
    // we will later define queue.metadata object while creating the queue
    console.log(`Started playing **${track.title}**!`);
});

async function execute(interaction: Message, q: string) {
    const channel = interaction.member!.voice.channel;
    if (!channel) return interaction.reply('You are not connected to a voice channel!'); // make sure we have a voice channel
    const query = q;
 
    // let's defer the interaction as things can take time to process
 
    try {
        const { track } = await player.play(channel, query, {
            nodeOptions: {
                // nodeOptions are the options for guild node (aka your queue in simple word)
                metadata: interaction, // we can access this metadata object using queue.metadata later on,
                volume: 2,
            }
        });
 
        return interaction.reply(`**${track.title}** enqueued!`);
    } catch (e) {
        // let's return error if something failed
        console.log("Error");
        console.log(e);
        return interaction.reply(`Something went wrong: ${e}`);
    }
}


/** LOGGING */
client.on(Events.ClientReady, (_c) => { logger.info(`The bot is online with ${commands.size} commands!`) });
client.once(Events.ClientReady, (c) => { logger.info(`Ready! Logged in as ${c.user.tag}`) });
client.on(Events.Debug, (s) => { logger.debug(s) });
client.on(Events.Warn, (s) => { logger.warning(s) });
client.on(Events.Error, (e) => { logger.error(e.stack) });
client.on(Events.InteractionCreate, (m) => { logger.debug(m) });

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
        logger.warning(`No command matching ${interaction.commandName} was found.`);
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
        if (error instanceof Error) {
            logger.warning(error.message);
            logger.error(error.stack ?? "", error);
        }


        await interaction.reply({
            content: "There was an error while executing this command!",
            ephemeral: true,
        });
    } finally {
        logger.debug("New chat interaction", meta);
    }
});

client.on('messageCreate', async (message) => {
    if (message.author.id == message.client.user.id) return;
    logger.log("trace", "Observed a message: " + message.content.substring(0, 30) + "...")

    if (message.content.startsWith('+')) {
        await execute(message, message.content.replace("+", ""));
    }
    if (!message.mentions.has(message.client.user)) return;

    if (message.content.length > 500) {
        await message.reply(GenericReply.WARNING);
        return;
    }

    logger.debug("Someone mentioned the bot", message.content);
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

