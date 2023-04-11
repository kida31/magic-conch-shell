import { CacheType, Client, Interaction, Message, StageChannel } from "discord.js";
import { Command } from "../commands/command";
import { LoggerWithLabel } from "../common/logger";
import PingCommand from "../commands/ping";
import { CommandCollection } from "../commands";
import { CustomAIBot } from "../external/open-ai/chatbot";

const logger = LoggerWithLabel("CommandHandler")

export class CommandHandler {
    private client: Client;
    private _prefix?: string;
    commands: Map<string, Command> = new Map();

    get prefix(): string | undefined {
        return this._prefix;
    }

    set prefix(value) {
        this._prefix = value;
    }

    constructor(client: Client, config?: { prefix?: string }) {
        this.client = client;
        this._prefix = config?.prefix;
        if (!this._prefix) {
            logger.warning("No prefix set");
        }

        // register
        this.registerCommand(new PingCommand());
        this.registerCommand(...CommandCollection.fromFolder("music"));

        // hook
        client.on('interactionCreate', (interaction: Interaction<CacheType>) => this.handleInteraction(interaction));
        client.on('messageCreate', (message: Message<boolean>) => this.handleMessage(message));
    }

    private async handleInteraction(interaction: Interaction<CacheType>) {
        // Not implemented
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

            if (message.mentions.has(message.client.user)) {
                if (message.content.length > 500) {
                    return;
                }
                
                if (!(message.channel instanceof StageChannel)) await message.channel.sendTyping();
                const res = await CustomAIBot.chat(message.cleanContent, message.author.username) ?? "Ask me again.";
                await message.reply(res);
                return;
            }
    
            // CustomAIBot.read(message.content);
        }
    }

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
}
