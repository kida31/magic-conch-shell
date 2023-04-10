import { CacheType, Client, Interaction, Message } from "discord.js";

export class CommandHandler {
    private client:Client;

    constructor(client: Client) {
        this.client = client;
        
        // hook

        this.client.on('interactionCreate', (interaction: Interaction<CacheType>) => this.handleInteraction(interaction));
        this.client.on('messageCreate', (message: Message<boolean>) => this.handleMessage(message));
    }

    private handleInteraction(interaction: Interaction<CacheType>) {

    }

    private handleMessage(message: Message<boolean>) {
        
    }

    public async deploy(): Promise<void>{

    }
}