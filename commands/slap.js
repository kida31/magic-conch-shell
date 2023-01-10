const {GifMessageBuilder} = require('../command-templates/slapkisshug')

module.exports = new GifMessageBuilder()
    .setName('slap')
    .setDescription('Slap someone')
    .setGifQuery('anime slap')
    .setEmbedDescription('%s slapped %s')
    .build()
