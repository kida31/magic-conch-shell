import { SlashCommandBuilder } from "discord.js";

import { deploy } from "../../deploy-commands";

import RESPONSES from "../../common/response";

import { GifMessageBuilder } from "../../command-templates/slapkisshug.js";

import common from "../../common/formatting.js";

const customCommands = {};

export const commands = {
  data: new SlashCommandBuilder()
    .setName("command")
    .setDescription("Commands administration")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("refresh")
        .setDescription("Updates commands")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("create")
        .setDescription("Creates custom reaction")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("Command name to invoke it")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("gifquery")
            .setDescription("The search word for the reaction gif")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("gifdescription")
            .setDescription(
              'Description text. (Example: `"{me} slapped {you}"`)',
            )
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Removes a custom reaction")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("Command name")
            .setRequired(true)
            .addChoices(...Object.keys(customCommands).asChoices())
        )
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "refresh") {
      await deploy(interaction.client.commands.map((c) => c.data.toJSON()));
      await interaction.reply(
        "Refreshed commands. Please don't abuse this. I might get banned",
      );
      return;
    }

    if (subcommand === "remove") {
      const name = interaction.options.getString("name");
      if (customCommands.hasOwnProperty(name)) {
        delete customCommands[name];
        await interaction.reply(RESPONSES.QUIET_CONFIRM);
        return;
      } else {
        await interaction.reply(RESPONSES.NO_RESULTS);
        return;
      }
    }

    if (subcommand === "create") {
      const name = interaction.options.getString("name");

      // assert
      if (
        customCommands.hasOwnProperty(name) ||
        interaction.client.commands.map((c) => c.data.name).includes(name)
      ) {
        await interaction.reply(RESPONSES.DUPLICATE);
        return;
      }
    }

    console.log("\n");
  },
};
