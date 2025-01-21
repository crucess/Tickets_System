const { EmbedBuilder } = require('discord.js');
const db = require('../lib/database/sql');

module.exports = async (client) => {
    const INACTIVITY_THRESHOLD_HOURS = 1; // Horas antes de notificar al staff
    const ABANDONED_THRESHOLD_HOURS = 24; // Horas antes de marcar como abandonado
    const staffChannelId = client.config.channels_logging.staff_notifications; // Canal de notificaciones al staff

    setInterval(async () => {
        try {
            // Obtener tickets abiertos e inactivos
            const query = `
                SELECT t.id, t.channel_id, t.user_id, t.username, TIMESTAMPDIFF(HOUR, t.last_activity, NOW()) AS hours_inactive
                FROM tickets_bot.tickets t
                WHERE t.status = 'open'
            `;
            db.query(query, async (err, results) => {
                if (err) {
                    console.error('Error al verificar actividad de tickets:', err);
                    return;
                }

                const staffChannel = client.channels.cache.get(staffChannelId);
                if (!staffChannel) {
                    console.error('No se encontró el canal de staff para notificaciones.');
                    return;
                }

                for (const ticket of results) {
                    if (ticket.hours_inactive >= ABANDONED_THRESHOLD_HOURS) {
                        // Marcar como abandonado
                        db.query(
                            `UPDATE tickets_bot.tickets SET status = 'abandoned' WHERE id = ?`,
                            [ticket.id],
                            (err) => {
                                if (err) console.error('Error al marcar ticket como abandonado:', err);
                            }
                        );

                        const abandonedEmbed = new EmbedBuilder()
                            .setTitle('⏳ Ticket Abandonado')
                            .setDescription(`El ticket **#${ticket.id}** creado por <@${ticket.user_id}> ha sido marcado como abandonado.`)
                            .setColor('RED')
                            .setTimestamp();

                        await staffChannel.send({ embeds: [abandonedEmbed] });
                    } else if (ticket.hours_inactive >= INACTIVITY_THRESHOLD_HOURS) {
                        // Notificar al staff
                        const reminderEmbed = new EmbedBuilder()
                            .setTitle('🔔 Recordatorio de Ticket Inactivo')
                            .setDescription(`El ticket **#${ticket.id}** creado por <@${ticket.user_id}> lleva ${ticket.hours_inactive} horas sin actividad.`)
                            .setColor('YELLOW')
                            .setTimestamp();

                        await staffChannel.send({ embeds: [reminderEmbed] });
                    }
                }
            });
        } catch (error) {
            console.error('Error en el monitoreo de actividad de tickets:', error);
        }
    }, 1000 * 60 * 60); // Ejecutar cada hora
};
