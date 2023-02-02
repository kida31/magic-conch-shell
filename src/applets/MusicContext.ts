import { Player, PlayerSearchResult, QueryType, Queue, Track } from "discord-player";
import { ChannelType, Client, CommandInteraction, TextChannel } from "discord.js";
import { logger as parentLogger } from "../common/logger";

const logger = parentLogger.child({ label: "MusicContext" })
type _InteractionType = CommandInteraction;

export class MusicContext {
    private static _player: Player
    static queueIdToTextChannel: Map<string, TextChannel> = new Map();

    interaction: _InteractionType
    _queue: Queue

    static get player(): Player {
        return this._player;
    }

    get player(): Player {
        return MusicContext._player;
    }

    get queue() {
        return this._queue;
    }

    static config(client: Client) {
        MusicContext._player = new Player(client, {
            ytdlOptions: {
                quality: "highestaudio",
                highWaterMark: 1 << 25,
            }
        });
    }

    static getTextChannel(queue: Queue) {
        const channel = this.queueIdToTextChannel.get(queue.id);
        return channel;
    }

    constructor(interaction: _InteractionType) {
        this.interaction = interaction;
        const queueUndefined = this.player.getQueue(interaction.guild!)
        if (queueUndefined) {
            this._queue = queueUndefined;
        } else {
            this._queue = this.player.createQueue(interaction.guild!);
        }

        if (interaction.channel?.type == ChannelType.GuildText) {
            MusicContext.queueIdToTextChannel.set(this._queue.id, interaction.channel);
        } else {
            logger.warning("What? ChannelType:" + interaction.channel?.type);
        }
    }

    async joinChannel(force: boolean = false): Promise<boolean> {
        if (force == false && this.isConnected) {
            return true;
        }

        const member = this.interaction.member!;

        if (!("voice" in member)) {
            logger.error("Unexpected. Member has no voice property", member);
            return false;
        }

        if (member.voice.channel === null) {
            logger.warning("User tried to call music bot without voice channel", member);
            return false;
        }

        const channel = member.voice.channel!;
        await this._queue.connect(channel);
        return true;
    }

    async play() {
        if (!this._queue.playing) await this._queue.play();
    }

    async skip() {
        this._queue.skip()
    }

    async stop() {
        this._queue.destroy(true);
    }

    async shuffle() {
        this._queue.shuffle();
    }

    async addTrack(track: Track, autoplay: boolean = true) {
        this._queue.addTrack(track);
        if (autoplay) await this.play();
    }

    async addTracks(tracks: Track[], autoplay: boolean = true) {
        this._queue.addTracks(tracks);
        if (autoplay) await this.play();
    }

    async search(query: string, queryType: QueryType | string): Promise<PlayerSearchResult> {
        logger.info(`Search requested`, {
            query, queryType, interactionId: this.interaction.id, user: {
                username: this.interaction.user.username,
                tag: this.interaction.user.tag,
            }
        });
        const result = await this.player.search(query, {
            requestedBy: this.interaction.user,
            searchEngine: queryType,
        })
        logger.info(`Search completed`, { by: this.interaction.id });
        return result;
    }

    get tracks(): Track[] {
        return this._queue.tracks;
    }

    get isConnected(): boolean {
        return this._queue.connection?.channel != null;
    }

    get current(): Track | undefined {
        try {
            return this._queue.connection ? this._queue.current : undefined;
        } catch (e) {
            if (e instanceof TypeError) {
                logger.warning("No current track");
                return undefined;
            }
            throw e;
        }
    }

    get nowPlaying(): Track | undefined {
        return this.current;
    }
}
