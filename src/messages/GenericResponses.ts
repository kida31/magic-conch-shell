import { ActionRowData, APIActionRowComponent, APIEmbed, APIMessageActionRowComponent, AutocompleteInteraction, CacheType, Interaction, InteractionReplyOptions, JSONEncodable, MessageActionRowComponentBuilder, MessageActionRowComponentData } from "discord.js";


class ResponseBuilder {
    _reply: InteractionReplyOptions

    constructor(ephemeral: boolean = false) {
        this._reply = { ephemeral: ephemeral };
    }

    ephemeral(): ResponseBuilder {
        this._reply.ephemeral = true;
        return this;
    }

    addEmbed(e: APIEmbed | JSONEncodable<APIEmbed>): ResponseBuilder {
        if (!this._reply.embeds) this._reply.embeds = [];
        this._reply.embeds.push(e);
        return this;
    }

    addComponent(c: APIActionRowComponent<APIMessageActionRowComponent> | JSONEncodable<APIActionRowComponent<APIMessageActionRowComponent>> | ActionRowData<MessageActionRowComponentData | MessageActionRowComponentBuilder>): ResponseBuilder {
        if (!this._reply.components) this._reply.components = [];
        this._reply.components.push(c);
        return this;
    }

    addContent(s: string): ResponseBuilder {
        this._reply.content = s;
        return this;
    }

    build(): InteractionReplyOptions {
        return this._reply;
    }

    reply(ctx: Interaction<CacheType>) {
        if (ctx.isAutocomplete()) return;
        ctx.reply(this._reply);
    }
}

export const PlayerResponses = {
    CONFIRM:
        { content: ":white_check_mark:" },
    CONFIRM_QUIET:
        { content: ":white_check_mark:", ephemeral: true, },
    ERROR:
        { content: ":no_entry_sign:" },
    WARNING:
        { content: ":warning:" }
}
