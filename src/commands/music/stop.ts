import { CacheType, EmbedBuilder, SlashCommandBuilder, StringSelectMenuInteraction } from "discord.js";
const { ActionRowBuilder, Events, StringSelectMenuBuilder } = require('discord.js');

import { QueryType, Track } from "discord-player";

import { MusicCommandBuilder } from "../../utils/CommandBuilder/MusicCommandBuilder";
import { Command } from "../Command";
import { logger } from "../../common/logger";
import { MusicContext } from "../../applets/MusicContext";
import MenuInteractionHandler from "../../menuinteractions/MenuInteractionHandler";
import { PlayerResponses } from "../../../src/messages/GenericResponses";

export default new MusicCommandBuilder("stop", "Stop music player")
    .addFunction(async (ctx) => {
        const music = new MusicContext(ctx);
        await music.stop();
        ctx.reply(PlayerResponses.CONFIRM)
    })
    .build();
