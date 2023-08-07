import {Music} from "./music";
import {GuildQueue, Player, QueueRepeatMode, Track} from "discord-player";
import {GuildMember, Interaction, Message, VoiceBasedChannel} from "discord.js";
import {ExtendedClient} from "../core/extended-client";
import {EASTER_EGG} from "./EASTER_EGG";
import {RepeatMode} from "./types";


// options for guild node (aka your queue)
const DEFAULT_NODE_OPTIONS = {
    volume: 2,
    repeatMode: QueueRepeatMode.AUTOPLAY,
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
                metadata: {channel: interaction.channel},
            });
    }

    async play(channel: VoiceBasedChannel, query: string): Promise<Track> {
        const user = (this.interaction.member instanceof GuildMember) ? this.interaction.member.user : undefined;
        const {track} = await this.player.play(channel, query === "" ? EASTER_EGG.query : query, {
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


