const { EmbedBuilder } = require('discord.js');
const db = require('../../lib/database/sql');

module.exports = async (interaction, client) => {
    if (interaction.customId === 'filter-category') {
        // Obtener resumen por categoría
        db.query(
            `
            SELECT c.name AS category, COUNT(t.id) AS count
            FROM tickets_bot.tickets t
            INNER JOIN tickets_bot.categories c ON t.category_id = c.id
            GROUP BY c.name
            `,
            async (err, results) => {
                if (err) {
                    console.error('Error al filtrar por categoría:', err);
                    return interaction.reply({ content: '❌ Hubo un error al filtrar por categoría.', ephemeral: true });
                }

                const embed = new EmbedBuilder()
                    .setTitle('🎫 Tickets por Categoría')
                    .setColor('Green')
                    .setDescription('Resumen del número de tickets por categoría.')
                    .addFields(
                        results.map(row => ({
                            name: row.category,
                            value: `${row.count} ticket(s)`,
                            inline: true,
                        }))
                    )
                    .setTimestamp();

                await interaction.update({ embeds: [embed], components: [] });
            }
        );
    } else if (interaction.customId === 'filter-status') {
        // Obtener resumen por estado
        db.query(
            `
            SELECT status, COUNT(id) AS count
            FROM tickets_bot.tickets
            GROUP BY status
            `,
            async (err, results) => {
                if (err) {
                    console.error('Error al filtrar por estado:', err);
                    return interaction.reply({ content: '❌ Hubo un error al filtrar por estado.', ephemeral: true });
                }

                const embed = new EmbedBuilder()
                    .setTitle('🎫 Tickets por Estado')
                    .setColor('Yellow')
                    .setDescription('Resumen del número de tickets por estado.')
                    .addFields(
                        results.map(row => ({
                            name: row.status.charAt(0).toUpperCase() + row.status.slice(1),
                            value: `${row.count} ticket(s)`,
                            inline: true,
                        }))
                    )
                    .setTimestamp();

                await interaction.update({ embeds: [embed], components: [] });
            }
        );
    }
};
