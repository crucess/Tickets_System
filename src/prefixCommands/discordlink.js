const { EmbedBuilder, AttachmentBuilder } = require("discord.js");

module.exports = {
	name: "discordlink",
	description: "Sends the discordlink embed",
	execute(message, args) {
		const embed = new EmbedBuilder()
			.setTitle("Linking System")
			.setDescription(
				"Linking your discord can be done by performing ``/verify`` within <#1192587137720262757>. This will return with a command that needs to be executed on 1 of our servers. Linking your discord with ark allows for faster help in tickets."
			)
			.setFooter({
				text: client.config.info.embed.footer,
				iconURL: client.user.displayAvatarURL(),
			})
			.setTimestamp()
			.setColor(client.config.info.embed.color);
			

		message.channel.send({ embeds: [embed] });
	},
};