import { CacheType, EmbedBuilder, SlashCommandBuilder, StringSelectMenuInteraction } from "discord.js";
const { ActionRowBuilder, Events, StringSelectMenuBuilder } = require('discord.js');

import { QueryType, Track } from "discord-player";

import { MusicCommandBuilder } from "../../utils/CommandBuilder/MusicCommandBuilder";
import { Command } from "../Command";
import { logger } from "../../common/logger";
import { MusicContext } from "../../applets/MusicContext";
import MenuInteractionHandler from "../../menuinteractions/MenuInteractionHandler";

export default new MusicCommandBuilder("play", "Play some music track")
    .addQueryOption()
    .addQueryTypeOption()
    .addFunction(async (ctx) => {
        const music = new MusicContext(ctx);
    })
    .build() as Command;
