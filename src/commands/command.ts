import {
  APIApplicationCommandSubcommandOption,
  CacheType,
  Interaction,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  RESTPostAPIContextMenuApplicationCommandsJSONBody,
} from "discord.js";


export interface Command {
  meta?: {
    name?: string;
    alias?: string[];
    description?: string;
    category?: string;
  };
  data: Object[] | Object;
  execute(interaction: Interaction<CacheType>): Promise<void>;
}

export function isCommand(obj: any): obj is Command {
  return "data" in obj && "execute" in obj
}

export type DeployableData =
  RESTPostAPIChatInputApplicationCommandsJSONBody |
  APIApplicationCommandSubcommandOption |
  RESTPostAPIContextMenuApplicationCommandsJSONBody;
