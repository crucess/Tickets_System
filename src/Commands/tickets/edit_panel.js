const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../lib/database/sql');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('edit-panel')
    .setDescription('Edita la descripción de un panel existente.')
    .addStringOption(option =>
      option
        .setName('message_id')
        .setDescription('El ID del mensaje del panel que quieres editar.')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('new_description')
        .setDescription('La nueva descripción para el panel.')
        .setRequired(true)
    ),
  async execute(interaction) {
    const messageId = interaction.options.getString('message_id');
    const newDescription = interaction.options.getString('new_description');

    try {
      // Buscar el panel en la base de datos
      db.query(
        'SELECT channel_id FROM tickets_bot.panels WHERE message_id = ?',
        [messageId],
        async (err, results) => {
          if (err) {
            console.error('Error en la consulta SQL:', err);
            return interaction.reply('❌ Hubo un error al buscar el panel.');
          }

          if (results.length === 0) {
            return interaction.reply('⚠️ No se encontró ningún panel con ese ID de mensaje.');
          }

          const channelId = results[0].channel_id;
          const channel = await interaction.guild.channels.fetch(channelId);
          const message = await channel.messages.fetch(messageId);

          // Editar el embed
          const embed = message.embeds[0]
            ? EmbedBuilder.from(message.embeds[0]).setDescription(newDescription)
            : new EmbedBuilder()
                .setTitle('🎫 Sistema de Tickets')
                .setDescription(newDescription)
                .setColor('#5865F2');

          await message.edit({ embeds: [embed] });
          interaction.reply(`✅ Descripción del panel actualizada con éxito.`);
        }
      );
    } catch (error) {
      console.error(error);
      await interaction.reply('❌ Hubo un error al editar el panel.');
    }
  },
};
