const {Player} = require("discord-player");

let INSTANCE = null


module.exports = {
    config: (client) => {
        INSTANCE = new Player(client, {
            ytdlOptions: {
                quality: "highestaudio",
                highWaterMark: 1 << 25,
            }
        });
    },
    getPlayer: () => INSTANCE,
    getQueue: (guild) => {
        console.log(typeof guild)
        return INSTANCE.getQueue(guild) ?? INSTANCE.createQueue(guild)
    }
}