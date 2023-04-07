import {
  APIApplicationCommandSubcommandOption,
  CacheType,
  ContextMenuCommandBuilder,
  Interaction,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  RESTPostAPIContextMenuApplicationCommandsJSONBody,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  StringSelectMenuInteraction,
} from "discord.js";

export type SlashCommandData = SlashCommandSubcommandsOnlyBuilder | Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand">
export type ContextMenuCommandData = ContextMenuCommandBuilder
export type CommandData = SlashCommandData | ContextMenuCommandData;

export type CommandExecute = (interaction: Interaction<CacheType>) => Promise<void>
export type CommandResolve = (interaction: StringSelectMenuInteraction) => Promise<void>;

export interface Command {
  meta?: {
    name?: string,
    description?: string,
    category?: string
  }
  data: CommandData
  execute: CommandExecute;
}

export interface UserContextMenuCommand extends Command {
  data: ContextMenuCommandData,
  execute: CommandExecute
}

export interface SlashCommand extends Command {
  data: SlashCommandData,
  execute: CommandExecute
}

export function isCommand(obj: any): obj is Command {
  return "data" in obj && "execute" in obj
}

export type DeployableData =
  RESTPostAPIChatInputApplicationCommandsJSONBody |
  APIApplicationCommandSubcommandOption |
  RESTPostAPIContextMenuApplicationCommandsJSONBody;
