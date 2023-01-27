const {Player, QueryType} = require("discord-player");
const response = require("../common/response");
const {EmbedBuilder} = require("discord.js");

let INSTANCE = null

function getPlayer() {
    return INSTANCE;
}

class MusicContext {
    constructor(interaction) {
        this.interaction = interaction;
        this.player = getPlayer();
        this.queue = this.player.getQueue(this.interaction.guild);
    }

    async joinChannel() {
        if (this.interaction.member.voice.channel === null){
            throw Error("User not in a channel");
        }
        this.queue.connect(this.interaction.member.voice.channel); // TODO Connect again?
    }

    async playTrack(track) {
        await this.queue.addTrack(track);
        await this.queue.play();
        return track;
    }

    async search(query, queryType) {
        const result = await this.player.search(query, {
            requestedBy: this.interaction.user,
            searchEngine: queryType
        })

        return result.tracks.length === 0 ? null : result;
    }
}

module.exports = {
    config: (client) => {
        INSTANCE = new Player(client, {
            ytdlOptions: {
                quality: "highestaudio",
                highWaterMark: 1 << 25,
            }
        });
    },
    getPlayer: getPlayer,
    getQueue: (guild) => {
        console.log(typeof guild)
        return INSTANCE.getQueue(guild) ?? INSTANCE.createQueue(guild)
    },
    MusicContext: MusicContext
}
