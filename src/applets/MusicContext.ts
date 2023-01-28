import { Player, PlayerSearchResult, QueryType, Queue, Track } from "discord-player";
import { ChatInputCommandInteraction, CacheType, GuildMember, Client } from "discord.js";
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
        this.queue = this.player.getQueue(interaction.guild!) ?? this.player.createQueue(interaction.guild!);
    }

    async joinChannel() {
        const member = this.interaction.member!;
        if (!("voice" in member)) {
            logger.error("Unexpected. Member has no voice property", member);
            return;
        }

        if (member.voice === null) {
            logger.warning("User tried to call music bot without voice channel", member);
            throw Error("User not in a channel");
        }

        this.queue.connect(member.voice.channel!);
    }

    async playTrack(track: Track) {
        this.queue.addTrack(track);
        await this.queue.play();
    }

    async search(query: string, queryType: QueryType | string): Promise<PlayerSearchResult> {
        const result = await this.player.search(query, {
            requestedBy: this.interaction.user,
            searchEngine: queryType
        })
        logger.info(`Music Search q=${query} queryType=${queryType}\n`, this.interaction);
        return result;
    }
}
