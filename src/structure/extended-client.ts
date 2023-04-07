import { Client, ClientOptions } from "discord.js";
import { Player } from "discord-player";


/** Extended client class to include discord-player.Player */
export class ExtendedClient extends Client {
    player: Player;
    commands: any;

    constructor(options: ClientOptions) {
        super(options);
        this.player = new Player(this);
    }
}