const { SlashCommandBuilder } = require('discord.js');
const db = require('../../lib/database/sql');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('claim-ticket')
        .setDescription('Reclama el ticket en el canal actual.'),
    async execute(interaction) {
        const channelId = interaction.channel.id; // ID del canal donde se ejecuta el comando
        const staffId = interaction.user.id;
        const staffName = interaction.user.tag;

        try {
            // Verificar si el canal actual está asociado a un ticket
            db.query(
                `SELECT id, status FROM tickets_bot.tickets WHERE channel_id = ?`,
                [channelId],
                (err, results) => {
                    if (err) {
                        console.error('Error al consultar la base de datos:', err);
                        return interaction.reply('❌ Hubo un error al consultar la base de datos.');
                    }

                    if (results.length === 0) {
                        return interaction.reply('⚠️ Este canal no está asociado a ningún ticket.');
                    }

                    const ticketId = results[0].id;
                    const ticketStatus = results[0].status;

                    if (ticketStatus !== 'open') {
                        return interaction.reply('⚠️ Este ticket ya ha sido reclamado o cerrado.');
                    }

                    // Reclamar el ticket
                    db.query(
                        `UPDATE tickets_bot.tickets
                         SET status = 'claimed', claimed_by = ?
                         WHERE id = ?`,
                        [staffId, ticketId],
                        (err) => {
                            if (err) {
                                console.error('Error al actualizar el ticket:', err);
                                return interaction.reply('❌ Hubo un error al reclamar el ticket.');
                            }

                            // Registrar el evento en la tabla `logs`
                            db.query(
                                `INSERT INTO tickets_bot.logs (ticket_id, event_type, details)
                                 VALUES (?, 'claimed', ?)`,
                                [ticketId, `Ticket reclamado por ${staffName}`],
                                (err) => {
                                    if (err) console.error('Error al registrar el log:', err);
                                }
                            );

                            console.log(`✅ Ticket ${ticketId} reclamado por ${staffName}`);

                            interaction.reply(`✅ Has reclamado el ticket de este canal.`);
                        }
                    );

                    // Incrementar estadísticas del staff
                    db.query(
                        `UPDATE tickets_bot.users
                         SET tickets_claimed = tickets_claimed + 1
                         WHERE user_id = ?`,
                        [staffId],
                        (err) => {
                            if (err) console.error('Error al actualizar estadísticas del staff:', err);
                        }
                    );
                }
            );
        } catch (error) {
            console.error('Error al reclamar el ticket:', error);
            interaction.reply('❌ Hubo un error al procesar tu solicitud.');
        }
    },
};
