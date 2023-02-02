import {
    ActionRowBuilder,
    ApplicationCommandType,
    ContextMenuCommandBuilder,
    Interaction,
    ModalBuilder,
    ModalSubmitInteraction,
    SlashCommandBuilder,
    TextInputBuilder,
    TextInputStyle,
    User
} from "discord.js";

import { logger as parentLogger } from "../../common/Logger";
import { UserContextMenuCommand } from "../Command";
import { GifMessageCommand } from "../templates/GifMessage";

const logger = parentLogger.child({ label: "command:custom-gif" });
const customId = (suffix?: string) => "custom-message" + suffix ? ("-" + suffix) : "";

export default {
    data: new ContextMenuCommandBuilder()
        .setName("other...")
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
            .setLabel("Displayed message")
            .setPlaceholder("ACTOR slapped TARGET")
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

                const user = submitInteraction.user;
                const target = interaction.targetUser;

                const gActor = await interaction.guild?.members.fetch(user.id)
                const gTarget = await interaction.guild?.members.fetch(target.id);

                const message = submitInteraction.fields.getTextInputValue(customId("message"))
                    .replaceAll("ACTOR", gActor?.displayName ?? user.toString())
                    .replaceAll("TARGET", gTarget?.displayName ?? target.toString());


                class CustomGifMessage extends GifMessageCommand {
                    async getParameters() {
                        return {
                            query: submitInteraction.fields.getTextInputValue(customId("query")),
                            message: message,
                            target: target
                        }
                    }
                    data = new SlashCommandBuilder();
                }

                await new CustomGifMessage().execute(submitInteraction);
            })
            .catch(err => logger.warning("Custom Message failed", err))
    }
} as UserContextMenuCommand
