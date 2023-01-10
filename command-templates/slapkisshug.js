const {SlashCommandBuilder} = require('discord.js')
const {EmbedBuilder} = require('discord.js');
const tenor = require('../plugins/tenor')


module.exports = {
    GifMessageBuilder: function () {
        return {
            name: null,
            description: null,
            gifQuery: null,
            embedDescription: null,

            setName: function (name) {
                this.name = name;
                return this;
            },

            setDescription: function (description) {
                this.description = description;
                return this;
            },
            setGifQuery: function (gifQuery) {
                this.gifQuery = gifQuery;
                return this;
            },
            setEmbedDescription: function (embedDescription) {
                this.embedDescription = embedDescription;
                return this;
            },
            build: function () {
                let CACHE = [];
                let name = this.name;
                let description = this.description;
                let gifQuery = this.gifQuery;
                let embedDescription = this.embedDescription;

                return {
                    data: new SlashCommandBuilder()
                        .setName(name)
                        .setDescription(description)
                        .addUserOption(option =>
                            option
                                .setName('target')
                                .setDescription(`Person to ${name}`)
                                .setRequired(true)),
                    async execute(interaction) {
                        if (CACHE.length === 0) {
                            const results = await tenor.search({q: gifQuery, media_filter: "tinygif", limit: "50"});
                            CACHE = results.map(r => r['media_formats']['tinygif']['url']);
                            console.log(`Populate Tenor cache for ${name}::${gifQuery}`)
                        }

                        const idx = Math.floor(Math.random() * CACHE.length);
                        const imageUrl = CACHE[idx];
                        const target = interaction.options.getUser('target');
                        const embed = new EmbedBuilder()
                            .setImage(imageUrl)
                            .setDescription(String(embedDescription)
                                .replace("%s", `**${interaction.user.username}**`)
                                .replace("%s", `**${target.username}**`))
                            .setFooter({text: "Powered by Tenor"});

                        await interaction.reply({content: target.toString(), embeds: [embed]});
                    }
                }
            }
        };
    }
}

