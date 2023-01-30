import {
  CacheType,
  ChatInputCommandInteraction,
  CommandInteraction,
  MessageContextMenuCommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  StringSelectMenuInteraction,
  UserContextMenuCommandInteraction
} from "discord.js";

export type CommandData = SlashCommandBuilder | SlashCommandSubcommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;

type OtherCmdInteraction = ChatInputCommandInteraction | MessageContextMenuCommandInteraction | UserContextMenuCommandInteraction;

export type CommandExecution = (interaction: CommandInteraction) => Promise<void>
export type CommandResolution = (interaction: StringSelectMenuInteraction) => Promise<void>;

export interface Command {
  data: CommandData// | CommandData[]
  execute: CommandExecution;
}

export function isCommand(obj: any): obj is Command {
  return "data" in obj && "execute" in obj;
}
