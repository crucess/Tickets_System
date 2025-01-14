const { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const os = require("os");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Shows bot's latency")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    premium: true,
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  execute(interaction, client) {
    let freemem = os.freemem() / (1024 * 1024 * 1024)
    let totalmem = os.totalmem() / (1024 * 1024 * 1024)
    let usedmem = totalmem - freemem

    const response = new EmbedBuilder()
    .setDescription(`⏰ Uptime : <t:${parseInt(client.readyTimestamp / 1000)}:R>\n🏓 Ping : ${client.ws.ping}ms\nMemory: ${usedmem.toFixed(1)} / ${totalmem.toFixed(1)} GB`).setColor('Blue')
    interaction.reply({ embeds: [response] });
  },
};