// Required interface for all music commands
import {VoiceBasedChannel} from "discord.js";
import {Track} from "discord-player";
import {RepeatMode} from "./types";

// TODO Change discord-player.Track to own class
export interface Music {
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

    setMode(mode: RepeatMode): Promise<void>;
}