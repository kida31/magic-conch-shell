import {
  APIApplicationCommandSubcommandOption,
  CacheType,
  ChatInputCommandInteraction,
  CommandInteraction,
  ContextMenuCommandBuilder,
  Interaction,
  InteractionType,
  MessageContextMenuCommandInteraction,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  RESTPostAPIContextMenuApplicationCommandsJSONBody,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  StringSelectMenuInteraction,
  UserContextMenuCommandInteraction
} from "discord.js";

type SlashCommandWithOptions = Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;

export type SlashCommandData = SlashCommandBuilder | SlashCommandSubcommandBuilder | SlashCommandWithOptions
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
  data: ContextMenuCommandBuilder,
  execute: CommandExecute
}

export interface SlashCommand extends Command {
  data: SlashCommandBuilder,
  execute: CommandExecute
}

export function isCommand(obj: any): obj is Command {
  return "data" in obj && "execute" in obj
}

export type DeployableData =
  RESTPostAPIChatInputApplicationCommandsJSONBody |
  APIApplicationCommandSubcommandOption |
  RESTPostAPIContextMenuApplicationCommandsJSONBody;
