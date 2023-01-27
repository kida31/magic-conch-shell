import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder
} from "discord.js";

import { QueryType } from "discord-player";


export interface Command {
  data: SlashCommandBuilder | SlashCommandSubcommandBuilder;
  execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void>;
}

function addQueryTypeOption(builder: SlashCommandBuilder, optional: bool = true): any {
  const querychoices = Object.dkeys(QueryType).filter(k => isNaN(k)).asChoices();
  const b = builder.addStringOption(option =>
    option.setName('querytype')
      .setDescription('discord-player:QueryType')
      .addChoices(...querychoices));
  return b;
}
