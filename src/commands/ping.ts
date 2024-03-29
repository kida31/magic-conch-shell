import { LogCommand } from "../common/logger";
import { QuickRegisterCommand } from "../core/command-decorator";
import { Command, CommandCategory, CommandContext, isInteraction } from "./command";

export default class PingCommand implements Command {
    category: CommandCategory = "Settings";

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
