import {
  APIApplicationCommandSubcommandOption,
  CacheType,
  Interaction,
  Message,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  RESTPostAPIContextMenuApplicationCommandsJSONBody,
} from "discord.js";

export type CommandContext = Interaction<CacheType> | Message<boolean>

export interface Command {
  name: string;
  alias?: string[];
  description?: string;
  category?: string;
  data?: Object[] | Object;
  execute(context: CommandContext): Promise<void>;
}

/** @deprecated */
export function isCommand(obj: any): obj is Command {
  return "data" in obj && "execute" in obj
}

export function isInteraction(context: Interaction<CacheType> | Message<boolean>): context is Interaction<CacheType> {
  return (context as Interaction<CacheType>).isRepliable !== undefined;
}

export function isMessage(input: any): input is Message {
  return typeof input === 'object' && input !== null && 'content' in input;
}

export type DeployableData =
  RESTPostAPIChatInputApplicationCommandsJSONBody |
  APIApplicationCommandSubcommandOption |
  RESTPostAPIContextMenuApplicationCommandsJSONBody;
