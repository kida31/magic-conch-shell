import { GifCommandBuilder } from "../../../utils/CommandBuilder/GifCommandBuilder";

module.exports = new GifCommandBuilder()
    .setName('slap')
    .setDescription('Slap someone')
    .setGifQuery('anime slap')
    .setEmbedDescription('%s slapped %s')
    .build()
