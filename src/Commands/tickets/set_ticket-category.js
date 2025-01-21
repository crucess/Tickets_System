const { SlashCommandBuilder } = require('discord.js');
const db = require('../../lib/database/sql');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set-ticket-category')
    .setDescription('Asigna una categoría de ticket a una categoría de Discord.')
    .addStringOption(option =>
      option
        .setName('ticket_category')
        .setDescription('Nombre de la categoría de ticket.')
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addChannelOption(option =>
      option
        .setName('discord_category')
        .setDescription('Categoría de Discord para los tickets.')
        .addChannelTypes(4) // Solo permite categorías de Discord
        .setRequired(true)
    ),
  async execute(interaction) {
    const ticketCategory = interaction.options.getString('ticket_category');
    const discordCategory = interaction.options.getChannel('discord_category');

    try {
      // Actualizar la categoría en la base de datos
      db.query(
        'UPDATE tickets_bot.categories SET discord_category_id = ? WHERE name = ?',
        [discordCategory.id, ticketCategory],
        (err, results) => {
          if (err) {
            console.error('Error al actualizar la categoría:', err);
            return interaction.reply('❌ Hubo un error al asignar la categoría.');
          }

          if (results.affectedRows === 0) {
            return interaction.reply('⚠️ No se encontró la categoría de ticket especificada.');
          }

          interaction.reply(`✅ La categoría de ticket **${ticketCategory}** ha sido asignada a **${discordCategory.name}**.`);
        }
      );
    } catch (error) {
      console.error('Error al ejecutar el comando:', error);
      interaction.reply('❌ Hubo un error al asignar la categoría.');
    }
  },
  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused();

    db.query('SELECT name FROM tickets_bot.categories', [], (err, results) => {
      if (err) {
        console.error('Error en el autocomplete de categorías:', err);
        return interaction.respond([]);
      }

      const filtered = results
        .map(cat => cat.name)
        .filter(name => name.toLowerCase().includes(focusedValue.toLowerCase()))
        .slice(0, 25);

      interaction.respond(
        filtered.map(name => ({ name, value: name }))
      );
    });
  },
};