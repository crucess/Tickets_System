const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../lib/database/sql');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('list-panels')
    .setDescription('Muestra un listado de todos los paneles existentes.'),
  async execute(interaction) {
    try {
      // Consultar los paneles en la base de datos
      db.query(
        `
        SELECT
          id,
          message_id,
          channel_id,
          JSON_LENGTH(options) AS category_count,
          created_at
        FROM tickets_bot.panels
        `,
        [],
        (err, results) => {
          if (err) {
            console.error('Error al consultar los paneles:', err);
            return interaction.reply('❌ Hubo un error al obtener el listado de paneles.');
          }

          if (results.length === 0) {
            return interaction.reply('⚠️ No se encontraron paneles en la base de datos.');
          }

          // Crear un embed para mostrar los paneles
          const embed = new EmbedBuilder()
            .setTitle('🎫 Listado de Paneles')
            .setDescription('Aquí están todos los paneles registrados en el sistema:')
            .setColor('#5865F2');

          // Añadir cada panel al embed
          results.forEach(panel => {
            embed.addFields({
              name: `🆔 Panel ID: ${panel.id}`,
              value: `
              **Mensaje ID:** ${panel.message_id}
              **Canal:** <#${panel.channel_id}>
              **Categorías:** ${panel.category_count || 0}
              **Creado:** ${new Date(panel.created_at).toLocaleString()}
              `,
              inline: false,
            });
          });

          // Responder con el embed
          interaction.reply({ embeds: [embed] });
        }
      );
    } catch (error) {
      console.error('Error al ejecutar el comando:', error);
      interaction.reply('❌ Hubo un error al listar los paneles.');
    }
  },
};
