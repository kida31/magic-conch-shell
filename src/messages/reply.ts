import {Colors, EmbedBuilder, Interaction, InteractionResponse, Message} from "discord.js";

const SUCCESS_COLOR = Colors.Fuchsia;
const WARNING_COLOR = Colors.Orange;
const ERROR_COLOR = Colors.Red;

async function replyToInteraction(interaction: Interaction, msg: { embeds: EmbedBuilder[], ephemeral?: boolean })
    : Promise<Message | InteractionResponse> {

    if (interaction.isCommand()) {
        if (interaction.deferred) {
            return interaction.editReply(msg);
        }

        if (interaction.replied) {
            return interaction.followUp(msg);
        }

        return interaction.reply(msg);
    }

    console.error("Did not know how to respond");
    throw new Error("Not implemented");
}

export async function info(interaction: Interaction, message: string) {
    const ebs = {
        embeds: [new EmbedBuilder().setDescription(message)]
    };
    return replyToInteraction(interaction, ebs);
}

export async function success(interaction: Interaction, message: string) {
    const ebs = {
        embeds: [new EmbedBuilder().setDescription(message).setColor(SUCCESS_COLOR)]
    };
    return replyToInteraction(interaction, ebs);
}

export async function warning(interaction: Interaction, message: string) {
    const ebs = {
        embeds: [new EmbedBuilder().setDescription(message).setColor(WARNING_COLOR)]
    };
    return replyToInteraction(interaction, ebs);
}

export async function error(interaction: Interaction, message: string) {
    const ebs = {
        embeds: [new EmbedBuilder().setDescription(message).setColor(ERROR_COLOR)]
    };
    return replyToInteraction(interaction, ebs);
}