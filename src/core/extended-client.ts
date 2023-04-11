import { Client, ClientOptions } from "discord.js";
import { Player } from "discord-player";
import { ChatBot } from "../external/interfaces";
import { CatGirlBot, MarinWithListener, Jarvis } from "../external/open-ai/chatbot";


/** Extended client class to include discord-player.Player */
export class ExtendedClient extends Client {
    player: Player;
    chatbot?: ChatBot;

    constructor(options: ClientOptions) {
        super(options);
        this.player = new Player(this);
        this.chatbot = MarinWithListener;
    }
}