import {
    ActionRowData,
    APIActionRowComponent,
    APIEmbed,
    APIMessageActionRowComponent,
    CacheType,
    ColorResolvable,
    EmbedBuilder,
    Interaction,
    InteractionReplyOptions,
    JSONEncodable,
    MessageActionRowComponentBuilder,
    MessageActionRowComponentData
} from "discord.js";


export interface GeneralReply {
    // General
    CONFIRM: InteractionReplyOptions
    CONFIRM_QUIET: InteractionReplyOptions
    WARNING: InteractionReplyOptions
    WARNING_QUIET: InteractionReplyOptions
    ERROR: InteractionReplyOptions
    ERROR_QUIET: InteractionReplyOptions
}

export const GenericReply = {
    get CONFIRM() {
        return { content: ":white_check_mark:" }
    },

    get CONFIRM_QUIET() {
        return embedReply(":white_check_mark:", "Green", true);
    },

    get WARNING() {
        return { content: ":warning:" }
    },

    get WARNING_QUIET() {
        return embedReply(":warning:", "Yellow", true);
    },

    get ERROR() {
        return { content: ":no_entry_sign:" }
    },

    get ERROR_QUIET() {
        return embedReply(":no_entry_sign:", "Red", true);
    }
}

export function embedMessage(message: string, color?: ColorResolvable): { embeds: (JSONEncodable<APIEmbed> | APIEmbed)[] } {
    const e = new EmbedBuilder().setDescription(message);
    if (color) e.setColor(color);
    return { embeds: [e] }
}

export function embedReply(message: string, color?: ColorResolvable, ephemeral?: boolean): InteractionReplyOptions {
    const e: InteractionReplyOptions = embedMessage(message, color);
    e.ephemeral = ephemeral;
    return e;
}
