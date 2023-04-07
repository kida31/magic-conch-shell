import { Track } from "discord-player";
import { VoiceBasedChannel } from "discord.js";

export interface IMusicPlayer {
    /** Searches song and adds to queue. Play if nothing is currently playing */
    play(channel: VoiceBasedChannel, query: string): Promise<Track>;

    /** Searches song and returns a track. */
    search(query: string): Promise<Track[]>;

    /** Adds one or more tracks to queue. Plays if nothing is currently playing */
    playTracks(channel: VoiceBasedChannel, ...tracks: Track[]): Promise<Track[]>;

    /** Stops playback */
    pause(): Promise<void>;

    /** Resumes playback */
    resume(): Promise<void>;

    /** Stops playback and disconnects bot */
    stop(): Promise<void>;

    /** Skips current song. Returns next song. */
    skip(): Promise<Track>;

    /** Returns currently played track */
    getNowPlaying(): Promise<Track>;

    /** Returns the queue */
    getQueue(): Promise<Track[]>;

    /** Shuffles queue. Returns shuffled queue.*/
    shuffleQueue(): Promise<Track[]>;
}