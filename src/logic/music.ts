import { Track, Player, GuildQueue } from "discord-player";
import { VoiceBasedChannel, Client, Interaction, Message, GuildMember } from "discord.js";
import { ExtendedClient } from "../core/extended-client";


// Required interface for all music commands
export interface MusicCommand {
    /** Searches song and adds to queue. Play if nothing is currently playing */
    play(channel: VoiceBasedChannel, query: string): Promise<Track>;

    /** Searches song and returns a track. */
    searchTracks(query: string, options?: {}): Promise<Track[]>;

    /** Adds one or more tracks to queue. Plays if nothing is currently playing */
    playTracks(channel: VoiceBasedChannel, ...tracks: Track[]): Promise<Track[]>;

    /** Stops playback */
    pause(): Promise<void>;

    /** Resumes playback */
    resume(): Promise<Track | null>;

    /** Stops playback and disconnects bot */
    stop(): Promise<void>;

    /** Skips current song. Returns next song. */
    skipSong(): Promise<Track | null>;

    /** Returns currently played track */
    getCurrentSong(): Promise<Track | null>;

    /** Returns the queue */
    getQueue(): Promise<Track[]>;

    /** Shuffles queue. Returns shuffled queue.*/
    shuffleQueue(): Promise<Track[]>;

    /** Clear queue */
    clearQueue(): Promise<void>;
}


// options for guild node (aka your queue)
const DEFAULT_NODE_OPTIONS = {
    volume: 2
};

// Hardcoded fallback values
const EASTER_EGG = {
    get query() {
        let queryList = ["sick enough to die", "never gonna give you up"]
        return queryList[Math.ceil(Math.random() * queryList.length - 1)];
    }
}

/**
 * Music command implementation for "discord-player"
 */
export class DiscordPlayer implements MusicCommand {
    private player: Player;
    private queue: GuildQueue;
    private interaction: Interaction | Message;

    constructor(interaction: Interaction | Message) {
        if (!interaction.guild) throw new Error("Not a guild interaction");

        const guild = interaction.guild;

        this.interaction = interaction;
        this.player = (<ExtendedClient>this.interaction.client).player;
        this.queue = this.player.nodes.get(guild) ??
            this.player.nodes.create(guild, { ...DEFAULT_NODE_OPTIONS, metadata: { channel: interaction.channel } });
    }

    async play(channel: VoiceBasedChannel, query: string): Promise<Track> {
        const user = (this.interaction.member instanceof GuildMember) ? this.interaction.member.displayName : "---";
        const { track } = await this.player.play(channel, query === "" ? EASTER_EGG.query : query, {requestedBy: user});
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
}