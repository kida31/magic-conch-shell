import { Client, ClientOptions } from "discord.js";
import { Player } from "discord-player";
import { ChatBot } from "../external/interfaces";
import { MarinChanBot } from "../external/open-ai/chatbot";
import { CommandHandler } from "./command-handler";


/** Extended client class to include discord-player.Player */
export class ExtendedClient extends Client {
    player: Player;
    chatbot?: ChatBot;
    commandHandler: CommandHandler;

    constructor({ prefix, ...options }: ClientOptions & { prefix: string }) {
        super(options);
        this.player = new Player(this);
        this.chatbot = MarinChanBot;
        this.commandHandler = new CommandHandler(this, { prefix })
    }
}