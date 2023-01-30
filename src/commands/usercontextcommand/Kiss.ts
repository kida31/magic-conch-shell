import { ApplicationCommandType, ContextMenuCommandBuilder, Interaction } from "discord.js";
import { doSomethingToTarget as replyCustomGif, generateExecute } from "../../utils/CommandBuilder/GifCommandBuilder";

export default {
    data: new ContextMenuCommandBuilder()
        .setName("Slap")
        .setType(ApplicationCommandType.User),
    aliases: [],
    async execute2(interaction: Interaction) {
        if (!interaction.isUserContextMenuCommand()) return;

        await replyCustomGif({
            interaction: interaction,
            gifQuery: "anime slap",
            message: `**${interaction.user.username}** slapped **${interaction.targetUser.username}**`,
            mention: interaction.targetUser
        })
    }
}


