import {
  APIApplicationCommandSubcommandOption,
  ChatInputCommandInteraction,
  CommandInteraction,
  ContextMenuCommandBuilder,
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

export type CommandData = SlashCommandBuilder | SlashCommandSubcommandBuilder | SlashCommandWithOptions | ContextMenuCommandBuilder;
export type CommandExecute = (interaction: CommandInteraction) => Promise<void>
export type CommandResolve = (interaction: StringSelectMenuInteraction) => Promise<void>;

export interface Command {
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
