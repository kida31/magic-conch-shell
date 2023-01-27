import { Player } from "discord-player";
import { Client } from "discord.js"

class ExtendedPlayer extends Player {
    private static instance: ExtendedPlayer;

    private constructor(client: Client) {
        super(client, {
            ytdlOptions: {
                quality: "highestaudio",
                highWaterMark: 1 << 25,
            }
        });
    }

    public static get Instance() {
        if (!this.instance) {
            throw new Error("Class has not been intialized.");
        }
        return this.instance;
    }

    public static initialize(client: Client) {
        if (this.instance) {
            throw new Error("Already initialized");
        }
        this.instance = new ExtendedPlayer(client);
    }
}

export { ExtendedPlayer };
