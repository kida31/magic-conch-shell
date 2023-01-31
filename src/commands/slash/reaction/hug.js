import { GifCommandBuilder } from "../../utils/CommandBuilder/GifCommandBuilder";
module.exports = new GifCommandBuilder()
    .setName('hug')
    .setDescription('Hug someone')
    .setGifQuery('anime hug')
    .setEmbedDescription('%s hugged %s')
    .build()
