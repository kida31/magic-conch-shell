import {
    ActionRowBuilder,
    ApplicationCommandType,
    ContextMenuCommandBuilder,
    Interaction,
    ModalBuilder,
    ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle,
    UserSelectMenuBuilder
} from "discord.js";

import { doSomethingToTarget } from "../../utils/CommandBuilder/GifCommandBuilder";
import { logger as parentLogger } from "../../common/logger";

const logger = parentLogger.child({ label: "command:custom-message" });

const customId = (suffix?: string) => "custom-message" + suffix ? ("-" + suffix) : "";

export default {
    data: new ContextMenuCommandBuilder()
        .setName("more...")
        .setType(ApplicationCommandType.User),
    async execute(interaction: Interaction) {
        if (!interaction.isUserContextMenuCommand()) return;

        const modal: ModalBuilder = new ModalBuilder()
            .setCustomId(customId())
            .setTitle("Create your own GIF message");

        const queryInput = new TextInputBuilder()
            .setCustomId(customId("query"))
            .setLabel("GIF search keyword(s)")
            .setPlaceholder("anime slap")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const messageInput = new TextInputBuilder()
            .setCustomId(customId("message"))
            .setLabel("Displayed message (??? = Placeholder)")
            .setValue("??? got slapped hard. (Use ??? as a placeholder for your target)")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false);

        modal.addComponents(
            new ActionRowBuilder({ components: [queryInput] }),
            new ActionRowBuilder({ components: [messageInput] })
        );

        await interaction.showModal(modal);

        const filter = (i: ModalSubmitInteraction) => i.customId == customId();
        interaction.awaitModalSubmit({ filter, time: 60_000 })
            .then(async (submitInteraction) => {
                logger.notice("I got something", submitInteraction);

                const target = interaction.targetUser;
                const message = submitInteraction.fields.getTextInputValue(customId("message")).replaceAll("???", target.toString())

                await doSomethingToTarget({
                    interaction: submitInteraction,
                    gifQuery: submitInteraction.fields.getTextInputValue(customId("query")),
                    message: message,
                    mention: target
                });
            })
            .catch(err => logger.warning("Custom Message failed", err))
    }
}

