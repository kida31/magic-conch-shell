import {
    APIEmbed,
    ColorResolvable,
    Colors,
    EmbedBuilder,
    Interaction,
    InteractionResponse,
    JSONEncodable,
    Message
} from "discord.js";

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

    if (interaction.channel) {
        return await interaction.channel?.send(msg);

    }
    console.error("Did not know how to respond");
    throw new Error("Not implemented");
}

/**
 * Send message to channel of interaction
 * @param interaction
 * @param options
 */
export async function send(interaction: Interaction, options: {
    text?: string,
    color?: ColorResolvable,
    embeds?: (JSONEncodable<APIEmbed> | APIEmbed)[],
}) {
    const {embeds, color, text} = options;
    if (!embeds && !text) {
        throw new Error('Pass either embeds or string');
    }
    const allEmbeds = embeds ?? [];
    if (text) {
        const eb = new EmbedBuilder().setDescription(text);
        if (color) {
            eb.setColor(color);
        }
        allEmbeds.push(eb);
    }
}

/**
 * Reply with info embed
 * @param interaction
 * @param message
 */
export async function info(interaction: Interaction, message: string) {
    const ebs = {
        embeds: [new EmbedBuilder().setDescription(message)]
    };
    return replyToInteraction(interaction, ebs);
}

/**
 * Reply with success embed
 * @param interaction
 * @param message
 */
export async function success(interaction: Interaction, message: string) {
    const ebs = {
        embeds: [new EmbedBuilder().setDescription(message).setColor(SUCCESS_COLOR)]
    };
    return replyToInteraction(interaction, ebs);
}

/**
 * Reply with warning embed
 * @param interaction
 * @param message
 */
export async function warning(interaction: Interaction, message: string) {
    const ebs = {
        embeds: [new EmbedBuilder().setDescription(message).setColor(WARNING_COLOR)]
    };
    return replyToInteraction(interaction, ebs);
}

/**
 * Reply with error embed
 * @param interaction
 * @param message
 */
export async function error(interaction: Interaction, message: string) {
    const ebs = {
        embeds: [new EmbedBuilder().setDescription(message).setColor(ERROR_COLOR)]
    };
    return replyToInteraction(interaction, ebs);
}