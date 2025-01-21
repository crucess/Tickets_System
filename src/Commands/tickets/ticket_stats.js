const { SlashCommandBuilder } = require('discord.js');
const db = require('../../lib/database/sql');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-stats')
        .setDescription('Muestra estadísticas del sistema de tickets.')
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('El usuario del que deseas ver las estadísticas.')
                .setRequired(false)
        ),
    async execute(interaction) {
        const user = interaction.options.getUser('usuario') || interaction.user;

        try {
            db.query(
                `SELECT tickets_created, tickets_claimed FROM tickets_bot.users WHERE user_id = ?`,
                [user.id],
                (err, results) => {
                    if (err) {
                        console.error('Error al consultar las estadísticas:', err);
                        return interaction.reply('❌ Hubo un error al obtener las estadísticas.');
                    }

                    if (results.length === 0) {
                        return interaction.reply(`⚠️ No se encontraron estadísticas para el usuario ${user.tag}.`);
                    }

                    const stats = results[0];
                    interaction.reply(`📊 **Estadísticas para ${user.tag}:**\n- Tickets creados: ${stats.tickets_created}\n- Tickets reclamados: ${stats.tickets_claimed}`);
                }
            );
        } catch (error) {
            console.error('Error al procesar el comando:', error);
            interaction.reply('❌ Hubo un error al procesar tu solicitud.');
        }
    },
};
