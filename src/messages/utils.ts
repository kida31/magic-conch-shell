import {
    APIEmbed,
    ColorResolvable,
    EmbedBuilder,
    Interaction,
    InteractionReplyOptions,
    InteractionResponse,
    JSONEncodable,
    Message
} from "discord.js";


export function createEmbedMsg(message: string, color?: ColorResolvable): {
    embeds: (JSONEncodable<APIEmbed> | APIEmbed)[]
} {
    const e = new EmbedBuilder().setDescription(message);
    if (color) e.setColor(color);
    return {embeds: [e]}
}

export function createEmbedReply(message: string, color?: ColorResolvable, ephemeral: boolean = true): InteractionReplyOptions {
    const e: InteractionReplyOptions = createEmbedMsg(message, color);
    e.ephemeral = ephemeral;
    return e;
}

export async function smartReply(interaction: Interaction, msg: {
    embeds?: EmbedBuilder[],
    ephemeral?: boolean,
    content?: string
})
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