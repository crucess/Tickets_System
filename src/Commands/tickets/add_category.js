const { SlashCommandBuilder } = require('discord.js');
const db = require('../../lib/database/sql');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('add-category')
    .setDescription('Agrega una nueva categoría de tickets.')
    .addStringOption(option =>
      option
        .setName('name')
        .setDescription('Nombre de la categoría.')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('description')
        .setDescription('Descripción de la categoría.')
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option
        .setName('max_tickets')
        .setDescription('Número máximo de tickets permitidos por usuario en esta categoría.')
        .setRequired(false)
    ),
  async execute(interaction) {
    const name = interaction.options.getString('name');
    const description = interaction.options.getString('description') || null;
    const maxTickets = interaction.options.getInteger('max_tickets') || 1;

    db.query(
      'INSERT INTO tickets_bot.categories (name, description, max_tickets_per_user) VALUES (?, ?, ?)',
      [name, description, maxTickets],
      (err, results) => {
        if (err) {
          console.error('Error en la consulta SQL:', err);
          return interaction.reply('❌ Hubo un error al agregar la categoría.');
        }

        interaction.reply(`✅ Categoría **${name}** creada con éxito.`);
      }
    );
  },
};
