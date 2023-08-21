import { GuildQueue, Player, QueueRepeatMode, Track } from "discord-player";
import { Channel, ChannelResolvable, GuildBasedChannel, GuildChannel, GuildChannelResolvable, GuildMember, GuildResolvable, GuildVoiceChannelResolvable, Interaction, Message, User, VoiceBasedChannel, VoiceChannel } from "discord.js";
import { EASTER_EGG } from "./EASTER_EGG";
import { RepeatMode } from "./types";


// options for guild node (aka your queue)
const DEFAULT_NODE_OPTIONS = {
    volume: 5,
    repeatMode: QueueRepeatMode.OFF,
};

/**
 * DiscordPlayerMusic command implementation for "discord-player"
 * Create
 */
export class MusicContext {
    private player: Player;
    private queue: GuildQueue;

    constructor(player: Player, guildId: string, textChannel?: Channel) {
        this.player = player;
        let existingQueue = this.player.nodes.get(guildId);

        if (!!existingQueue) {
            this.queue = existingQueue;
        } else {

            this.queue = this.player.nodes.create(guildId, {
                ...DEFAULT_NODE_OPTIONS,
                metadata: { channel: textChannel },
            });
        }
    }

    /** Searches song and adds to queue. Play if nothing is currently playing */
    async play(voiceChannelId: string, query: string, requestedBy: User | string, textChannel?: Channel): Promise<Track> {
        const { track } = await this.player.play(voiceChannelId, query === "" ? EASTER_EGG.query : query, {
            requestedBy: requestedBy,
            searchEngine: query.startsWith('http') ? "auto" : "youtube",
        });


        if (!!textChannel) {
            const metadata = this.queue.metadata as any;
            metadata.channel = textChannel;
            this.queue.setMetadata(metadata)
        }
        return track;
    }

    /** Stops playback */
    pause(): boolean {
        return this.queue.node.pause();
    }

    /** Resumes playback */
    resume(): Track | null {
        this.queue.node.resume();
        return this.queue.currentTrack;
    }

    /** Stops playback and disconnects bot */
    stop(): boolean {
        const b = this.queue.node.stop();
        this.queue.delete();
        return b;
    }

    /** Skips current song. Returns next song. */
    skipSong(): Track | null {
        this.queue.node.skip();
        return this.queue.currentTrack;
    }

    /** Returns currently played track */
    getCurrentSong(): Track | null {
        return this.queue.currentTrack;
    }

    /** Returns the queue */
    getQueue(): Track[] {
        return this.queue.tracks.data;
    }

    /** Shuffles queue. Returns shuffled queue.*/
    shuffleQueue(): Track[] {
        this.queue.tracks.shuffle();
        return this.queue.tracks.data;
    }

    /** Clear queue */
    clearQueue(): void {
        this.queue.clear();
    }

    getProgressBar(): string | null {
        return this.queue.node.createProgressBar();
    }

    setMode(mode: RepeatMode): void {
        const internalRepeatMode = {
            'off': QueueRepeatMode.OFF,
            '1': QueueRepeatMode.TRACK,
            'all': QueueRepeatMode.QUEUE,
            'auto': QueueRepeatMode.AUTOPLAY
        }[mode];
        this.queue.setRepeatMode(internalRepeatMode);
    }

    setVolume(newVol: number): boolean {
        return this.queue.node.setVolume(newVol);
    }
}
