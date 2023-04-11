import { Track, GuildQueue } from "discord-player";
import { BaseMessageOptions, EmbedBuilder, InteractionReplyOptions } from "discord.js";
import { createSimpleReply, embedMessage } from "../../messages/Common";


class _MusicCommandMessage {
    CONFIRM() {
        return { content: ":white_check_mark:" }
    }

    CONFIRM_QUIET() {
        return createSimpleReply(":white_check_mark:", "Green", true);
    }

    WARNING() {
        return { content: ":warning:" }
    }

    WARNING_QUIET() {
        return createSimpleReply(":warning:", "Yellow", true);
    }

    ERROR() {
        return { content: ":no_entry_sign:" }
    }

    ERROR_QUIET() {
        return createSimpleReply(":no_entry_sign:", "Red", true);
    }

    ADDED_TRACK(track: Track) {
        const e = new EmbedBuilder()
            .setTitle("Queued")
            .setThumbnail(track.thumbnail)
            .setDescription(`[${track.title}](${track.url}) - ${track.author}\nRequested by ${track.requestedBy}`)
            .setColor("Grey");

        return {
            embeds: [e]
        }
    }

    ADDED_TRACKS(tracks: Track[]) {
        return embedMessage("PLACEHOLDER Added " + tracks.length + " tracks.", "Grey");
    }

    ADDED_PLAYLIST() {
        return embedMessage("PLACEHOLDER Added playlist", "Grey");
    }

    NOW_PLAYING(t: Track | null, progressBar?: string) {
        if (!t) return this.NOTHING_PLAYING();
        return {
            embeds: [new EmbedBuilder()
                .setTitle("Now playing " + (!!t ? ":arrow_forward: " : ":pause_button:"))
                .setThumbnail(t.thumbnail)
                .setDescription(`${t.title} - ${t.author}\n${progressBar}\n\nRequested by ${t.requestedBy}`)
                .setColor("Blue")]
        }

    }

    NOTHING_PLAYING() {
        return embedMessage("There is nothing playing", "Grey");
    }

    QUEUE_EMPTY() {
        return embedMessage("There are no songs in the queue", "Red")
    }

    QUEUED_TRACKS(tracks: Track[], current?: Track, progressBar?: string): BaseMessageOptions {
        const embed = new EmbedBuilder().setTitle("Queue");
        const reqBy = current?.requestedBy;

        if (reqBy) {
            embed
                .setAuthor({ name: reqBy.toString(), iconURL: reqBy.avatarURL() ?? reqBy.defaultAvatarURL })
                .setThumbnail(reqBy.avatarURL() ?? reqBy.defaultAvatarURL)
        }

        let description = "";
        const stringify = (t: Track) => `[${t.title}](${t.url}) \`${t.duration}\` ${t.requestedBy}`;

        if (current) {
            embed.setThumbnail(current.thumbnail);
            description += `[${progressBar}\n${current.title} - ${current.author}](${current.url}) ${current.requestedBy}}\n\n`
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

        return { embeds: [embed] };
    }

    STOPPED() {
        return embedMessage("Bye", "Blue");
    }

    SKIPPED() {
        return embedMessage("Skipped current song", "Blue");
    }

    NO_RESULTS(query?: string) {
        return { ...embedMessage("No results found" + (query ? (" for " + query) : ""), "Grey"), ephemeral: true }
    }

    USER_NOT_IN_VOICE() {
        return createSimpleReply("You're not in a voice channel", "Red", true);
    }

    INVALID_OPERATION() {
        return createSimpleReply("Operation was invalid.", "Red", true);
    }

    NONE() {
        return { content: " ", ephemeral: true }
    }

    SHUFFLED() {
        return embedMessage("Shuffled the queue", "Green")
    }
}

export const MusicCommandMessage = new _MusicCommandMessage();