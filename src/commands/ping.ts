import { LogCommand } from "../common/logger";
import { Command, isInteraction } from "./command";



export default class PingCommand implements Command {
    category?: string | undefined;
    data?: Object | Object[] | undefined;

    name = "ping";
    alias = ['test'];
    description = "Pings the bot";


    @LogCommand("ping")
    async execute(context: any): Promise<void> {
        if (isInteraction(context) && context.isRepliable()) {
            await context.reply("Pong!");
        } else {
            await context.channel?.send(`Pong! ${context.member?.toString()}`);
        }
    }
}
