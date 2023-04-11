import { EmbedBuilder } from "discord.js";
import { ExtendedClient } from "../../core/extended-client";
import { Command, CommandCategory, CommandContext, isMessage } from "../command";
import { CommandCollection } from "..";

export default class HelpCommand implements Command {
    name: string = "help";
    alias?: string[] | undefined;
    description?: string | undefined = "Show available commands and descriptions";
    category?: CommandCategory = "Settings";
    // data?: Jsonable | Jsonable[] | undefined;
    async execute(context: CommandContext): Promise<void> {
        const client = <ExtendedClient>context.client;

        const commands: Command[] = getUniqueCommands([...client.commandHandler.commands.values()]);
        const bot = client.user!;

        const categories = Array.from(new Set(commands
            .map((c: Command) => c.category)));

        let commandEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            // .setTitle('Help')
            .setAuthor({ name: bot.username, iconURL: bot.avatarURL()! })
            .addFields(...categories.map(cat => (
                {
                    name: cat ?? "Unsorted",
                    value: commands.filter(cmd => cat === cmd.category)
                        .map(cmd => `▪️**${cmd.name}**: ${cmd.description ?? "_description is missing_"}`)
                        .join("\n")
                }
            )))
            .setFooter({ text: `${commands.length} commands` });

        await context.channel?.send({ embeds: [commandEmbed] })
    }
}


function getUniqueCommands(commands: Command[]): Command[] {
    return commands.reduce((acc: Command[], curr: Command) => {
        const index = acc.findIndex(c => c.name === curr.name);
        if (index === -1) {
            // current command name not found in accumulator
            return [...acc, curr];
        } else {
            return acc;
        }
    }, []);
}