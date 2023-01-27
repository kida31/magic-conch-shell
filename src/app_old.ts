const { Client, Collection, Events, GatewayIntentBits, IntentsBitField, } = await import("discord.js");
import { Player } from "discord-player";
import * as fs from "node:fs";
import * as path from "node:path";

import logger from "./services/logger";

import { load } from "https:/deno.land/std/dotenv/mod.ts";
import { Command } from "./commands/command.js";
// const { TOKEN: token, CLIENT_ID: clientId, GUILD_ID: guildId } = await load();
const argv = Deno.args;

/** PARSE CLI ARGUMENTS */
const noLogin = argv.includes("--nologin");
const deployCommands = argv.includes("--deploy");

/** CREATE CLIENT INSTANCE */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
  ],
});

client.on(Events.ClientReady, () => logger.info("The bot is online"));
client.on(Events.Debug, (m) => logger.debug(m));
client.on(Events.Warn, (m) => logger.warn(m));
client.on(Events.Error, (m) => logger.error(m));
client.on(Events.InteractionCreate, (m) => logger.trace(m));
client.once(Events.ClientReady, (c) => logger.info(`Ready! Logged in as ${c.user.tag}`));

/** SETUP MUSIC PLAYER */
{
  const { config: musicConfig } = await import("./services/music.js");
  musicConfig(client);
}

client.on(Events.InteractionCreate, handleInteraction);

if (deployCommands) {
  const { deploy } = await import("./deploy-commands");
  if (deployCommands) {
    deploy(client.commands.map((c) => c.data.toJSON())).then((r) =>
      "Deploy completed"
    );
  }
}

if (!noLogin) {
  /** Login/Run */
  client.login(token);
}

/** Handlers */
async function handleInteraction(interaction) {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
}
