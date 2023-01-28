import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  StringSelectMenuInteraction
} from "discord.js";

import { QueryType } from "discord-player";

type CommandExecution = (interaction: ChatInputCommandInteraction<CacheType>) => Promise<void>

type CommandData = SlashCommandBuilder | SlashCommandSubcommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;

interface Command {
  data: CommandData
  execute: CommandExecution;
}

type CommandResolution = (interaction: StringSelectMenuInteraction<CacheType>) => Promise<void>;

interface SelectMenuCommand extends Command {
  resolve: CommandResolution
}

export {
  Command,
  CommandExecution,
  CommandData,
  SelectMenuCommand,
  CommandResolution
}

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
