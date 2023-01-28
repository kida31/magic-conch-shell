import { GifCommandBuilder } from "../../utils/CommandBuilder/GifCommandBuilder";
module.exports = new GifCommandBuilder()
    .setName('kiss')
    .setDescription('Kiss someone')
    .setGifQuery('anime kiss')
    .setEmbedDescription('%s kissed %s')
    .build()
