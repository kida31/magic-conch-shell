import { Playlist, Queue, Track } from "discord-player";
import { ActionRowData, APIActionRowComponent, APIEmbed, APIMessageActionRowComponent, AutocompleteInteraction, CacheType, ColorResolvable, EmbedBuilder, Interaction, InteractionReplyOptions, JSONEncodable, MessageActionRowComponentBuilder, MessageActionRowComponentData, MessagePayload, MessagePayloadOption, User } from "discord.js";
import { MusicContext } from "../../src/applets/MusicContext";
import { StringDecoder } from "string_decoder";
import { logger } from "../../src/common/logger";


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

interface GeneralReply {
    // General
    CONFIRM: InteractionReplyOptions
    CONFIRM_QUIET: InteractionReplyOptions
    WARNING: InteractionReplyOptions
    WARNING_QUIET: InteractionReplyOptions
    ERROR: InteractionReplyOptions
    ERROR_QUIET: InteractionReplyOptions
}

class PlayerMessageImpl implements GeneralReply {
    get CONFIRM() {
        return { content: ":white_check_mark:" }
    }

    get CONFIRM_QUIET() {
        return embedReply(":white_check_mark:", "Green", true);
    }

    get WARNING() {
        return { content: ":warning:" }
    }

    get WARNING_QUIET() {
        return embedReply(":warning:", "Yellow", true);
    }

    get ERROR() {
        return { content: ":no_entry_sign:" }
    }

    get ERROR_QUIET() {
        return embedReply(":no_entry_sign:", "Red", true);
    }

    ADDED_TRACK(track: Track, queue?: Queue) {
        const e = new EmbedBuilder()
            .setTitle("Queued")
            .setThumbnail(track.thumbnail)
            .setDescription(`[${track.title}](${track.url}) - ${track.author}\nRequested by ${track.requestedBy}`)
            .setColor("Grey");
        if (queue) e.setFooter({
            text: "In position #" + queue.tracks.length
        })
        return {
            embeds: [e]
        }
    }

    ADDED_TRACKS(tracks: Track[]) {
        return embedMessage("PLACEHOLDER Added " + tracks.length + " tracks.", "Grey");
    }

    ADDED_PLAYLIST(playlist: Playlist) {
        return embedMessage("PLACEHOLDER Added playlist", "Grey");
    }

    NOW_PLAYING(queue: Queue) {
        const t: Track = queue.current;
        return {
            embeds: [new EmbedBuilder()
                .setTitle("Now playing")
                .setThumbnail(t.thumbnail)
                .setDescription(`${t.title} - ${t.author}\n${queue.createProgressBar()}\n\nRequested by ${t.requestedBy}`)
                .setColor("Blue")]
        }
    }

    get QUEUE_EMPTY() {
        return embedMessage("There are no songs in the queue", "Red")
    }

    QUEUED_TRACKS(queue: Queue): InteractionReplyOptions {
        const author = queue.player.client.user;
        const current = queue.current;
        const tracks = queue.tracks;
        const embed = new EmbedBuilder().setTitle("Queue");

        if (author) {
            embed
                .setAuthor({ name: author.username, iconURL: author.avatar ?? author.defaultAvatarURL })
                .setThumbnail(author.avatar ?? author.defaultAvatarURL)
        }

        let description = "";
        const stringify = (t: Track) => `[${t.title}](${t.url}) \`${t.duration}\` ${t.requestedBy}`;

        if (current) {
            embed.setThumbnail(current.thumbnail);
            description += `[${current.title} - ${current.author}](${current.url}) ${current.requestedBy}}\n${queue.createProgressBar()}\n\n`
        }

        if (tracks.length > 0) {
            description += tracks
                .slice(0, 100)
                .map((t, idx) => `${idx + 1}. ${stringify(t)}`)
                .join('\n');
        }

        if (description != "") {
            embed.setDescription(description);
        }

        const durationMs = tracks.map(t => t.durationMS).reduce((accumulate, value) => accumulate + value, 0);
        embed.addFields({
            name: tracks.length + " tracks in total",
            value: (durationMs / (1000 * 60)).toFixed(2)
                + " minute(s)"
        });

        return { embeds: [embed], ephemeral: true };
    }

    get STOPPED() {
        return embedMessage("Bye", "Blue");
    }

    get SKIPPED() {
        return embedMessage("Skipped current song", "Blue");
    }

    NO_RESULTS(query?: string) {
        return embedMessage("No results found" + query ? (" for " + query) : "", "Grey")
    }

    get USER_NOT_IN_VOICE() {
        return embedReply("Youre not in a voice channel", "Red", true);
    }

    get INVALID_OPERATION() {
        return embedReply("Operation was invalid.", "Red", true);
    }

    get NONE() {
        return { content: " ", ephemeral: true }
    }

    get SHUFFLED() {
        return embedMessage("Shuffled the queue", "Green")
    }
}
export const PlayerMessage = new PlayerMessageImpl();

function embedMessage(message: string, color?: ColorResolvable): { embeds: (JSONEncodable<APIEmbed> | APIEmbed)[] } {
    const e = new EmbedBuilder().setDescription(message);
    if (color) e.setColor(color);
    return { embeds: [e] }
}

function embedReply(message: string, color?: ColorResolvable, ephemeral?: boolean): InteractionReplyOptions {
    const e: InteractionReplyOptions = embedMessage(message, color);
    e.ephemeral = ephemeral;
    return e;
}
