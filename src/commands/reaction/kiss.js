import {GifMessageBuilder} from "../command-templates/slapkisshug";


module.exports = new GifMessageBuilder()
    .setName('kiss')
    .setDescription('Kiss someone')
    .setGifQuery('anime kiss')
    .setEmbedDescription('%s kissed %s')
    .build()
