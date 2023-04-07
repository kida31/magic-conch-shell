import { SlashCommandBuilder } from "discord.js";
import roasts from './roasts.json';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('roast')
		.setDescription('Roasts a user!')
		.addUserOption(option =>
			option
				.setName('user')
				.setDescription('Select the user to roast')
				.setRequired(true)
		),
		async execute(interaction: { reply: (arg0: string) => any; deleteReply: () => any; options: { getUser: (arg0: string) => null; getInteger: (arg0: string) => number; }; channel: { send: (arg0: string) => any; name: any; }; user: { send: (arg0: string) => any; }; guild: { name: any; }; }) {

			// Shady work-around to avoid having to send a reply but also avoid the "interaction didn't respond" message.
			await interaction.reply("if you can read this you're extremely fast and i'm fascinated by your fast reading skills!");
			await interaction.deleteReply();

			// Figuring out the desired target, number and creating the default message content.
			const target = interaction.options.getUser('user') ?? null;
			const num = Math.ceil(Math.random() * roasts.length - 1);
			const message = roasts[num].roast;		

			// Determining if the target is set, if not it should just send the message "AS IS"
			try {
				if (target == null) {
					return await interaction.channel.send(message);
				}
				return await interaction.channel.send(`${target}, ${message}`);
			} catch (err) {
				console.error(err);

				// Error code 50013 is Missing permissions to channel
				//if (err.code == 50013) {
				//	return await interaction.user.send(`Whoops. it looks like i'm unable to send messages in: ${interaction.guild.name} > #${interaction.channel.name}`);
				//}
			}
		}
}

module.exports.roasts = roasts;