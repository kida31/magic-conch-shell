import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  StringSelectMenuInteraction
} from "discord.js";

export type CommandData = SlashCommandBuilder | SlashCommandSubcommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
export type CommandExecution = (interaction: ChatInputCommandInteraction<CacheType>) => Promise<void>
export type CommandResolution = (interaction: StringSelectMenuInteraction<CacheType>) => Promise<void>;

export interface Command {
  data: CommandData
  execute: CommandExecution;
}

export function isCommand(obj: any): obj is Command {
  return "data" in obj && "execute" in obj;
}
