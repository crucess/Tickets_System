const { SlashCommandBuilder } = require('discord.js');
const db = require('../../lib/database/sql');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('delete-category')
    .setDescription('Elimina una categoría existente.')
    .addStringOption(option =>
      option
        .setName('name')
        .setDescription('Nombre de la categoría a eliminar.')
        .setAutocomplete(true) // Activar la funcionalidad de autocomplete
        .setRequired(true)
    ),
  async execute(interaction) {
    const name = interaction.options.getString('name');

    db.query(
      'DELETE FROM tickets_bot.categories WHERE name = ?',
      [name],
      (err, results) => {
        if (err) {
          console.error('Error en la consulta SQL:', err);
          return interaction.reply('❌ Hubo un error al eliminar la categoría.');
        }

        if (results.affectedRows === 0) {
          return interaction.reply(`⚠️ No se encontró ninguna categoría con el nombre **${name}**.`);
        }

        interaction.reply(`✅ Categoría **${name}** eliminada con éxito.`);
      }
    );
  },
  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused();
    
    db.query('SELECT name FROM tickets_bot.categories', [], (err, results) => {
      if (err) {
        console.error('Error en la consulta de autocomplete:', err);
        return interaction.respond([]);
      }

      const filtered = results
        .map(cat => cat.name)
        .filter(name => name.toLowerCase().includes(focusedValue.toLowerCase()))
        .slice(0, 25); // Discord permite un máximo de 25 opciones

      interaction.respond(
        filtered.map(name => ({ name, value: name }))
      );
    });
  },
};
