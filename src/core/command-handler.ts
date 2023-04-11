import { CacheType, Client, Interaction, Message, StageChannel } from "discord.js";
import { Command, CommandCategory } from "../commands/command";
import { LoggerWithLabel } from "../common/logger";

import PingCommand from "../commands/ping";
import { ExtendedClient } from "./extended-client";
import { DiscordPlayer } from "../logic/music";

const logger = LoggerWithLabel("CommandHandler")


export class CommandHandler {
    private client: ExtendedClient;
    private _prefix?: string;
    commands: Map<string, Command> = new Map();

    get prefix(): string | undefined {
        return this._prefix;
    }

    set prefix(value) {
        this._prefix = value;
    }

    constructor(client: ExtendedClient, config?: { prefix?: string }) {
        this.client = client;
        this._prefix = config?.prefix;
        if (!this._prefix) {
            logger.warning("No prefix set");
        }

        // register
        this.registerCommand(new PingCommand());

        // hook
        client.on('interactionCreate', (interaction: Interaction<CacheType>) => this.handleInteraction(interaction));
        client.on('messageCreate', (message: Message<boolean>) => this.handleMessage(message));
    }

    private async handleInteraction(interaction: Interaction<CacheType>) {
        // Not implemented
        let command: Command | undefined;

        if (!interaction.isChatInputCommand()) {
            return;
        }

        command = this.commands.get(interaction.commandName);

        if (!command) {
            logger.warn("Unknown slash command");
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            if (error instanceof Error) {
                logger.error(error.stack ?? "", error);
            }

            await interaction.reply({
                content: "There was an error while executing this command!",
                ephemeral: true,
            });
        }
    }

    private async handleMessage(message: Message<boolean>) {
        // Shouldn't react to own messages
        if (message.member?.user === message.client.user) return;

        if (!!this.prefix && message.content.startsWith(this.prefix)) {
            // Without prefix
            message.content = message.content.replace(this.prefix, "");
            const [name, ...rest] = message.content.split(" ");
            message.content = rest.join(" ").trim();

            const cmd = this.commands.get(name);
            if (cmd) {
                logger.info(name);
                await cmd.execute(message);
            } else {
                logger.info("Unknown command: " + name);
                // Unknown command
            }
        } else {
            logger.debug(`Ignored ${message.content}`);

            await this.handleChat(message);
        }
    }

    private async handleChat(message: Message) {
        if (message.mentions.has(message.client.user) && this.client.chatbot) {
            const chatbot = this.client.chatbot;

            if (message.content.length > 500) {
                return;
            }

            let isTyping = true;

            // Wait for intervals of 5seconds
            async function waitOrTypeForSeconds(seconds: number, sendTyping: Function): Promise<void> {
                async function delay(ms: number): Promise<void> {
                    return new Promise(resolve => setTimeout(resolve, ms));
                }

                while (seconds > 0 && isTyping) {
                    seconds -= 5;
                    await sendTyping();
                    await delay(5000);
                }
            }

            const sendTyping = async () => {
                if (!(message.channel instanceof StageChannel)) await message.channel.sendTyping();
            }

            try {
                const res = await Promise.race([
                    chatbot.chat(message.cleanContent, message.member?.displayName ?? ""),
                    waitOrTypeForSeconds(35, sendTyping).then(() => undefined)])
                    ?? "I didn't hear you. Ask me again.";

                const filteredResponse = await this.handleInternalCommands(message, res);
                await message.reply(filteredResponse);
            } catch (error) {
                logger.warning(error);
            } finally {
                isTyping = false;
            }
        }
    }
    // TODO rename to registerCommands
    public registerCommand(...commands: Command[]): void {
        commands.forEach(command => {
            this.registerCommandAs(command, command.name);
            command.alias?.forEach(altName => this.registerCommandAs(command, altName));
        });
    }

    private registerCommandAs(command: Command, name: string): void {
        if (this.commands.has(name)) {
            logger.warning(`Duplicate command identifier '${name}' - overwriting...`);
        }
        logger.info("Registered command for " + name);
        this.commands.set(name, command);
    }

    public async deploy(): Promise<void> {

    }

    private async handleInternalCommands(message: Message, response: string): Promise<string> {
        const regex = /\[\[(.+)]\]/;
        const match = response.match(regex);
        if (match) {
            logger.info("Bot invokes command >> " + response);

            const textInBrackets = match[1];
            response = response.replace(`[[${textInBrackets}]]`, '');
            const [cmd, ...rest] = textInBrackets.split(';')

            const query = rest.join(" ");
            const music = new DiscordPlayer(message);

            if (cmd === "play" && message.member?.voice.channel) {
                await music.play(message.member.voice.channel, query);
            }

            if (cmd === "skip") {
                await music.skipSong();
            }
        }

        return response;
    }
}


