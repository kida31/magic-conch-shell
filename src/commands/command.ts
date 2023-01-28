import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder
} from "discord.js";

import { QueryType } from "discord-player";

interface Command {
  data: SlashCommandBuilder | SlashCommandSubcommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
  execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void>;
}

export { Command }

export function isCommand(obj: any): obj is Command {
  return "data" in obj && "execute" in obj;
}

// function addQueryTypeOption(builder: SlashCommandBuilder, optional: bool = true): any {
//   const querychoices = Object.keys(QueryType).filter(k => isNaN(k)).asChoices();
//   const b = builder.addStringOption(option =>
//     option.setName('querytype')
//       .setDescription('discord-player:QueryType')
//       .addChoices(...querychoices));
//   return b;
// }
