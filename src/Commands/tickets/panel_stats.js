const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../lib/database/sql');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('panel-stats')
    .setDescription('Muestra estadísticas de un panel.')
    .addStringOption(option =>
      option
        .setName('panel_id')
        .setDescription('ID del panel que quieres consultar.')
        .setRequired(true)
    ),
  async execute(interaction) {
    const panelId = interaction.options.getString('panel_id');

    try {
      // Consulta de estadísticas
      db.query(
        `
        SELECT 
          COUNT(*) AS total_tickets,
          COUNT(DISTINCT user_id) AS unique_users
        FROM tickets_bot.ticket_stats
        WHERE panel_id = ?`,
        [panelId],
        (err, results) => {
          if (err) {
            console.error('Error al consultar estadísticas:', err);
            return interaction.reply('❌ Hubo un error al obtener las estadísticas del panel.');
          }

          if (results.length === 0 || results[0].total_tickets === 0) {
            return interaction.reply('⚠️ No se encontraron estadísticas para este panel.');
          }

          const { total_tickets, unique_users } = results[0];

          // Crear el embed de estadísticas
          const embed = new EmbedBuilder()
            .setTitle('📊 Estadísticas del Panel')
            .setDescription(`Estadísticas para el panel con ID: **${panelId}**`)
            .addFields(
              { name: '🎟️ Total de Tickets Creados', value: `${total_tickets}`, inline: true },
              { name: '👤 Usuarios Únicos', value: `${unique_users}`, inline: true }
            )
            .setColor('#5865F2');

          interaction.reply({ embeds: [embed] });
        }
      );
    } catch (error) {
      console.error('Error al ejecutar el comando:', error);
      interaction.reply('❌ Hubo un error al consultar las estadísticas.');
    }
  },
};
