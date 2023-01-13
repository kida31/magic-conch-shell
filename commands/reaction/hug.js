const {GifMessageBuilder} = require('../../command-templates/slapkisshug')

module.exports = new GifMessageBuilder()
    .setName('hug')
    .setDescription('Hug someone')
    .setGifQuery('anime hug')
    .setEmbedDescription('%s hugged %s')
    .build()
