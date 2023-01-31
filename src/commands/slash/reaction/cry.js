import { GifCommandBuilder } from "../../../utils/CommandBuilder/GifCommandBuilder";

module.exports = new GifCommandBuilder()
    .setName('cry')
    .setDescription('Cries to someone')
    .setGifQuery('anime cry')
    .setEmbedDescription('%s cried to %s')
    .build()
