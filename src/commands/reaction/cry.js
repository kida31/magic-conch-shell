import {GifMessageBuilder} from "../command-templates/slapkisshug";


module.exports = new GifMessageBuilder()
    .setName('cry')
    .setDescription('Cries to someone')
    .setGifQuery('anime cry')
    .setEmbedDescription('%s cried to %s')
    .build()
