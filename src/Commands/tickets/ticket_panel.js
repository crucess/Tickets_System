const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../lib/database/sql');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-panel')
        .setDescription('Muestra un resumen de los tickets para administradores.'),
    async execute(interaction) {
        if (!interaction.member.permissions.has('ManageGuild')) {
            return interaction.reply('❌ No tienes permisos para usar este comando.');
        }

        try {
            // Obtener resumen general de los tickets
            const query = `
                SELECT 
                    COUNT(CASE WHEN status = 'open' THEN 1 END) AS open,
                    COUNT(CASE WHEN status = 'claimed' THEN 1 END) AS claimed,
                    COUNT(CASE WHEN status = 'abandoned' THEN 1 END) AS abandoned
                FROM tickets_bot.tickets;
            `;
            db.query(query, async (err, results) => {
                if (err) {
                    console.error('Error al obtener el resumen de tickets:', err);
                    return interaction.reply('❌ Hubo un error al generar el panel.');
                }

                const summary = results[0];

                // Crear el embed inicial
                const embed = new EmbedBuilder()
                    .setTitle('🎫 Panel de Administración de Tickets')
                    .setDescription('Resumen del estado actual de los tickets.')
                    .setColor('Blue')
                    .addFields(
                        { name: 'Tickets Abiertos', value: `${summary.open || 0}`, inline: true },
                        { name: 'Tickets Reclamados', value: `${summary.claimed || 0}`, inline: true },
                        { name: 'Tickets Abandonados', value: `${summary.abandoned || 0}`, inline: true },
                    )
                    .setFooter({ text: 'Usa los botones para filtrar por categoría o estado.' })
                    .setTimestamp();

                // Crear botones interactivos
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('filter-category')
                        .setLabel('Filtrar por Categoría')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('filter-status')
                        .setLabel('Filtrar por Estado')
                        .setStyle(ButtonStyle.Secondary),
                );

                // Enviar el embed y los botones
                await interaction.reply({ embeds: [embed], components: [row] });
            });
        } catch (error) {
            console.error('Error al ejecutar el comando /ticket-panel:', error);
            interaction.reply('❌ Hubo un error al ejecutar este comando.');
        }
    },
};
