import {Track} from "discord-player";
import {BaseMessageOptions, EmbedBuilder, Colors} from "discord.js";
export const DEFAULT_COLORS = {
    OK: Colors.Blurple,
    UNSUCCESSFUL: Colors.Grey,
    WARNING: Colors.Orange,
    ERROR: Colors.Red,
}

export const SKIPPED: string = "Skipped current song";
export const CONFIRM: string = ":white_check_mark:";
export const WARNING: string = ":warning:";
export const ERROR: string = ":no_entry_sign:";
export const NOTHING_PLAYING: string = "There is nothing playing";
export const QUEUE_EMPTY: string = "There are no songs in the queue";
export const USER_NOT_IN_VOICE: string = "You're not in a voice channel";
export const INVALID_OPERATION: string = "Operation was invalid.";
export const SHUFFLED: string = "Shuffled the queue";
export const STOPPED: string = "Bye";
export const ADDED_PLAYLIST: string = "Added playlist";

export function ADDED_TRACKS(tracks: Track[]) {
    return "Added " + tracks.length + " tracks.";
}

export function NO_RESULTS(query?: string) {
    return "No results found" + (query ? (" for " + query) : "");
}

export function ADDED_TRACK(track: Track) {
    return new EmbedBuilder()
        .setTitle("Queued")
        .setThumbnail(track.thumbnail)
        .setDescription(`[${track.title}](${track.url}) - ${track.author}\nRequested by ${track.requestedBy}`)
        .setColor("Grey");
}

export function NOW_PLAYING(t: Track, progressBar?: string) {
    return {
        embeds: [new EmbedBuilder()
            .setTitle("Now playing " + (!!t ? ":arrow_forward: " : ":pause_button:"))
            .setThumbnail(t.thumbnail)
            .setDescription(`${t.title} - ${t.author}\n${progressBar}\n\nRequested by ${t.requestedBy}`)
            .setColor("Blue")]
    }
}

export function QUEUED_TRACKS(tracks: Track[], current?: Track, progressBar?: string, numShown: number = 20): BaseMessageOptions {
    const embed = new EmbedBuilder().setTitle("Queue");
    const reqBy = current?.requestedBy;

    if (reqBy) {
        embed
            .setAuthor({name: reqBy.username, iconURL: reqBy.avatarURL() ?? reqBy.defaultAvatarURL})
            .setThumbnail(reqBy.avatarURL() ?? reqBy.defaultAvatarURL)
    }

    let description = "";
    const stringifyTrack = (t: Track) => `[${t.title}](${t.url}) \`${t.duration}\` ${t.requestedBy}`;
    const stringifyTracks = (ts: Track[]) => ts.map((t, idx) => `${idx + 1}. ${stringifyTrack(t)}`);

    if (current) {
        embed.setThumbnail(current.thumbnail);
        description += `[${progressBar}\n${current.title} - ${current.author}](${current.url}) ${current.requestedBy}\n\n`
    }

    if (tracks.length > 0) {
        description += stringifyTracks(tracks.slice(0, numShown)).join('\n');
    }

    if (description !== "") {
        if (description.length > 4090) {
            description = description.substring(0, 4090);
        }
        if (tracks.length > numShown) {
            description += "\n...";
        }
        embed.setDescription(description);
    }

    const durationMs = tracks.map(t => t.durationMS).reduce((accumulate, value) => accumulate + value, 0);
    embed.addFields({
        name: tracks.length + " tracks in total",
        value: (durationMs / (1000 * 60)).toFixed(2)
            + " minute(s)"
    });

    return {embeds: [embed]};
}