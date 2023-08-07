import {Client, ClientOptions} from "discord.js";
import {Player} from "discord-player";
import {ChatBot} from "../external/interfaces";
import {MarinChanBot} from "../external/open-ai/chatbot";
import {CommandHandler} from "./command-handler";
import {error, info, success, warning} from "../messages/reply";


/** Extended client class to include discord-player.Player */
export class ExtendedClient extends Client {
    musicPlayer: Player;
    chatBot?: ChatBot;
    commandHandler: CommandHandler;
    reply = {info, success, warning, error}

    constructor({prefix, ...options}: ClientOptions & { prefix: string }) {
        super(options);
        this.musicPlayer = new Player(this);
        this.chatBot = MarinChanBot;
        this.commandHandler = new CommandHandler(this, {prefix})
    }

}