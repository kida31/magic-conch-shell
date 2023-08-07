import {
    APIEmbed,
    ColorResolvable,
    EmbedBuilder,
    InteractionReplyOptions,
    JSONEncodable
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

