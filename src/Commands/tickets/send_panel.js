const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../lib/database/sql');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('send-panel')
    .setDescription('Envía un panel de tickets a un canal específico.')
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('El canal donde se enviará el panel.')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('category1')
        .setDescription('Primera categoría (obligatoria).')
        .setAutocomplete(true)
        .setRequired(true)
    )
    .addStringOption(option =>
        option
          .setName('description')
          .setDescription('Descripción del panel.')
          .setRequired(true)
      )
    .addStringOption(option =>
      option
        .setName('category2')
        .setDescription('Segunda categoría (opcional).')
        .setAutocomplete(true)
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('category3')
        .setDescription('Tercera categoría (opcional).')
        .setAutocomplete(true)
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('category4')
        .setDescription('Cuarta categoría (opcional).')
        .setAutocomplete(true)
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('category5')
        .setDescription('Quinta categoría (opcional).')
        .setAutocomplete(true)
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('category6')
        .setDescription('Sexta categoría (opcional).')
        .setAutocomplete(true)
        .setRequired(false)
    ),
  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const description = interaction.options.getString('description');

    // Obtener las categorías seleccionadas (mínimo 1 y máximo 6)
    const categories = [];
    for (let i = 1; i <= 6; i++) {
      const category = interaction.options.getString(`category${i}`);
      if (category) categories.push(category.trim());
    }

    if (categories.length === 0) {
      return interaction.reply('❌ Debes seleccionar al menos una categoría.');
    }

    try {
      // Verificar las categorías seleccionadas en la base de datos
      db.query(
        'SELECT name FROM tickets_bot.categories WHERE name IN (?)',
        [categories],
        async (err, results) => {
          if (err) {
            console.error('Error en la consulta SQL:', err);
            return interaction.reply('❌ Hubo un error al cargar las categorías.');
          }

          if (!results || results.length === 0) {
            return interaction.reply('⚠️ No se encontraron categorías válidas para el panel.');
          }

          // Crear el menú con las categorías seleccionadas
          const options = results.map(cat => ({
            label: cat.name,
            value: cat.name.toLowerCase(),
          }));

          const menu = new StringSelectMenuBuilder()
            .setCustomId('ticket-menu')
            .setPlaceholder('Selecciona una categoría')
            .setMinValues(1) // Mínimo de una categoría seleccionada
            .setMaxValues(1) // Máximo según las opciones disponibles
            .addOptions(options);

          const row = new ActionRowBuilder().addComponents(menu);

          // Crear el embed del panel
          const embed = new EmbedBuilder()
            .setTitle('🎫 Sistema de Tickets')
            .setDescription(description)
            .setColor('#5865F2'); // Cambia el color según lo que prefieras

          // Enviar el panel al canal especificado
          const message = await channel.send({
            embeds: [embed],
            components: [row],
          });

          // Guardar el panel en la base de datos
          db.query(
            'INSERT INTO tickets_bot.panels (message_id, channel_id, options) VALUES (?, ?, ?)',
            [message.id, channel.id, JSON.stringify(options)],
            err => {
              if (err) {
                console.error('Error al guardar el panel:', err);
                return interaction.reply('❌ Hubo un error al guardar el panel en la base de datos.');
              }

              interaction.reply(`✅ Panel enviado al canal <#${channel.id}> con las categorías seleccionadas.`);
            }
          );
        }
      );
    } catch (error) {
      console.error(error);
      await interaction.reply('❌ Hubo un error al enviar el panel.');
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
        .slice(0, 25); // Discord permite un máximo de 25 opciones

      interaction.respond(
        filtered.map(name => ({ name, value: name }))
      );
    });
  },
};
