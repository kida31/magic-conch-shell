import { Music } from "./music";
import { GuildQueue, Player, QueueRepeatMode, Track } from "discord-player";
import { ChannelResolvable, GuildBasedChannel, GuildChannel, GuildChannelResolvable, GuildMember, GuildResolvable, GuildVoiceChannelResolvable, Interaction, Message, VoiceBasedChannel, VoiceChannel } from "discord.js";
import { ExtendedClient } from "../core/extended-client";
import { EASTER_EGG } from "./EASTER_EGG";
import { RepeatMode } from "./types";
import { InvalidArgumentException, NotFoundError } from "../common/error";
import { fetchChannel } from "../discord-info/guild-info";


// options for guild node (aka your queue)
const DEFAULT_NODE_OPTIONS = {
    volume: 2,
    repeatMode: QueueRepeatMode.OFF,
};

/**
 * DiscordPlayerMusic command implementation for "discord-player"
 * Create
 */
export class DiscordPlayerAction implements Music {
    private player: Player;
    private queue: GuildQueue;
    private interaction: Interaction | Message;

    constructor(interaction: Interaction | Message) {
        if (!interaction.guild) throw new Error("Not a guild interaction");

        const guild = interaction.guild;

        this.interaction = interaction;
        this.player = (<ExtendedClient>this.interaction.client).musicPlayer;
        this.queue = this.player.nodes.get(guild) ??
            this.player.nodes.create(guild, {
                ...DEFAULT_NODE_OPTIONS,
                metadata: { channel: interaction.channel },
            });
    }

    async play(channel: VoiceBasedChannel, query: string): Promise<Track> {
        const user = (this.interaction.member instanceof GuildMember) ? this.interaction.member.user : undefined;
        const { track } = await this.player.play(channel, query === "" ? EASTER_EGG.query : query, {
            requestedBy: user,
            searchEngine: query.startsWith('http') ? "auto" : "youtube",
        });
        return track;
    }

    async searchTracks(query: string, options?: {}): Promise<Track[]> {
        const result = await this.player.search(query);
        return result.tracks;
    }

    async playTracks(channel: VoiceBasedChannel, ...tracks: Track[]): Promise<Track[]> {
        await this.player.play(channel, tracks);
        return tracks;
    }

    async pause(): Promise<void> {
        this.queue.node.pause();
    }

    async resume(): Promise<Track | null> {
        this.queue.node.resume();
        return this.queue.currentTrack;
    }

    async stop(): Promise<void> {
        this.queue.node.stop();
        this.queue.delete();
    }

    async skipSong(): Promise<Track | null> {
        this.queue.node.skip();
        return this.queue.currentTrack;
    }

    async getCurrentSong(): Promise<Track | null> {
        return this.queue.currentTrack;
    }

    async getQueue(): Promise<Track[]> {
        return this.queue.tracks.data;
    }

    async shuffleQueue(): Promise<Track[]> {
        this.queue.tracks.shuffle();
        return await this.getQueue();
    }

    async clearQueue(): Promise<void> {
        this.queue.clear();
    }

    async getProgressBar(): Promise<string | null> {
        return this.queue.node.createProgressBar();
    }

    async setMode(mode: RepeatMode): Promise<void> {
        const internalRepeatMode = {
            'off': QueueRepeatMode.OFF,
            '1': QueueRepeatMode.TRACK,
            'all': QueueRepeatMode.QUEUE,
            'auto': QueueRepeatMode.AUTOPLAY
        }[mode];
        this.queue.setRepeatMode(internalRepeatMode);
    }

    async setVolume(newVol: number): Promise<void> {
        this.queue.node.setVolume(newVol);
    }
}

function findQueue(player: Player, guildId: GuildResolvable) {
    return player.nodes.get(guildId);
}

function getQueue(player: Player, guildId: GuildResolvable) {
    const queue = findQueue(player, guildId);
    if (queue == null) {
        throw new NotFoundError("No guild for ID found " + guildId);
    }
    return queue;
}

/** Initialize queue with default volume and playback option */
async function initOrLoad(player: Player, guild: GuildResolvable) {
    if (player.nodes.get(guild)) {
        // already initialized
        return;
    }

    player.nodes.create(guild, {
        ...DEFAULT_NODE_OPTIONS,
        metadata: { channel: undefined },
    });
}

export function getCurrentTrack(player: Player, guildId: GuildResolvable) {
    const queue = getQueue(player, guildId);
    return queue.currentTrack;
}

export async function setRecentChannel(player: Player, channel: GuildChannelResolvable) {
    let resolvedChannel: GuildBasedChannel;

    if (typeof channel === "string") {
        resolvedChannel = await fetchChannel(player.client, channel);
    } else {
        resolvedChannel = channel;
    }

    const guild = resolvedChannel.guild;

    const queue = getQueue(player, guild);
    const metadata = queue.metadata as any;

    metadata.channel = resolvedChannel;
    queue.setMetadata(metadata)
}

export async function playQuery(
    player: Player,
    voiceChannelId: string,
    query: string,
    other?: {
        requestedBy?: any,
        recentChannel?: GuildChannelResolvable
    }) {
    
    const guild = await (await fetchChannel(player.client, voiceChannelId)).guild;
    await initOrLoad(player, guild);

    const requestedBy = other?.requestedBy;
    // For feedback from bot on music events (play/next)
    const recentChannel = other?.recentChannel;
    const { track } = await player.play(voiceChannelId, query,
        {
            requestedBy: requestedBy,
            searchEngine: query.startsWith('http') ? "auto" : "youtube",
        });

    if (!!recentChannel) {
        await setRecentChannel(player, voiceChannelId);
    }
    return track;
}