import { Player, PlayerSearchResult, QueryType, Queue, Track } from "discord-player";
import { ChatInputCommandInteraction, CacheType, GuildMember, Client } from "discord.js";
import { disconnect } from "process";
import { logger } from "../common/logger";

export class MusicContext {
    static _player: Player
    player: Player
    interaction: ChatInputCommandInteraction<CacheType>
    queue: Queue

    static config(client: Client) {
        MusicContext._player = new Player(client, {
            ytdlOptions: {
                quality: "highestaudio",
                highWaterMark: 1 << 25,
            }
        });
    }
    constructor(interaction: ChatInputCommandInteraction<CacheType>) {
        this.interaction = interaction;
        this.player = MusicContext._player;
        const queue = this.player.getQueue(interaction.guild!)
        if (queue) {
            this.queue = queue;
        } else {
            logger.info("Created Queue for guildName=" + interaction.guild?.name);
            this.queue = this.player.createQueue(interaction.guild!);
        }
    }

    async joinChannel(force: boolean = false) {
        if (force == false && this.queue.connection?.channel != null) {
            return;
        }

        const member = this.interaction.member!;
        if (!("voice" in member)) {
            logger.error("Unexpected. Member has no voice property", member);
            return;
        }

        if (member.voice === null) {
            logger.warning("User tried to call music bot without voice channel", member);
            throw Error("User not in a channel");
        }

        await this.queue.connect(member.voice.channel!);
    }

    async stop() {
        this.queue.destroy(true);
    }

    async playTrack(track: Track) {
        this.queue.addTrack(track);
        await this.queue.play();
    }

    async addTrack(track: Track, autoplay: boolean = true) {
        this.queue.addTrack(track);
        if (!this.queue.playing) await this.queue.play();
    }

    async addTracks(tracks: Track[], autoplay: boolean = true) {
        this.queue.addTracks(tracks);
        await this.queue.play();
    }

    async search(query: string, queryType: QueryType | string): Promise<PlayerSearchResult> {
        const result = await this.player.search(query, {
            requestedBy: this.interaction.user,
            searchEngine: queryType
        })
        logger.info(`Music Search q=${query} queryType=${queryType}`);
        return result;
    }
}
