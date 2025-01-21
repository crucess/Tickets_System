const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const db = require('../../lib/database/sql');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('close-ticket')
        .setDescription('Cierra el ticket en el canal actual, incluyendo mensajes e imágenes.'),
    async execute(interaction) {
        const channelId = interaction.channel.id;

        try {
            // Verificar si el canal está asociado a un ticket
            db.query(
                `SELECT id, status, user_id, username FROM tickets_bot.tickets WHERE channel_id = ?`,
                [channelId],
                async (err, results) => {
                    if (err) {
                        console.error('Error al consultar la base de datos:', err);
                        return interaction.reply('❌ Hubo un error al consultar la base de datos.');
                    }

                    if (results.length === 0) {
                        return interaction.reply('⚠️ Este canal no está asociado a ningún ticket.');
                    }

                    const ticketId = results[0].id;
                    const ticketStatus = results[0].status;

                    if (ticketStatus === 'closed') {
                        return interaction.reply('⚠️ Este ticket ya está cerrado.');
                    }

                    const ticketOwner = `${results[0].username} (${results[0].user_id})`;

                    // Recopilar mensajes del canal
                    const messages = await interaction.channel.messages.fetch({ limit: 100 });
                    const transcript = messages
                        .map(msg => {
                            let content = `[${msg.createdAt.toISOString()}] ${msg.author.tag} : ${msg.content || '(Mensaje vacío)'}`;
                            // Agregar URLs de los adjuntos si existen
                            if (msg.attachments.size > 0) {
                                const attachments = msg.attachments.map(att => `- Archivo: ${att.url}`).join('\n');
                                content += `\n${attachments}`;
                            }
                            return content;
                        })
                        .reverse()
                        .join('\n');

                    // Guardar el transcript en un archivo
                    const transcriptPath = `transcripts/ticket-${ticketId}.txt`;
                    fs.writeFileSync(transcriptPath, transcript);

                    // Crear un archivo adjunto para enviar
                    const transcriptAttachment = new AttachmentBuilder(transcriptPath);

                    // Actualizar el estado del ticket en la base de datos
                    db.query(
                        `UPDATE tickets_bot.tickets
                         SET status = 'closed', closed_at = NOW()
                         WHERE id = ?`,
                        [ticketId],
                        (err) => {
                            if (err) {
                                console.error('Error al cerrar el ticket:', err);
                                return interaction.reply('❌ Hubo un error al cerrar el ticket en la base de datos.');
                            }

                            // Registrar un log del cierre
                            db.query(
                                `INSERT INTO tickets_bot.logs (ticket_id, event_type, details)
                                 VALUES (?, 'closed', ?)`,
                                [ticketId, `Ticket cerrado por ${interaction.user.tag}`],
                                (err) => {
                                    if (err) console.error('Error al registrar el log:', err);
                                }
                            );

                            console.log(`✅ Ticket ${ticketId} cerrado. Transcript guardado en ${transcriptPath}`);
                        }
                    );

                    // Informar al canal y enviar el transcript
                    await interaction.reply({
                        content: `✅ Este ticket ha sido cerrado por ${interaction.user.tag}.`,
                        files: [transcriptAttachment],
                    });

                    // Eliminar el canal después de un breve tiempo
                    setTimeout(() => {
                        interaction.channel.delete().catch(err => console.error('Error al eliminar el canal:', err));
                    }, 5000);
                }
            );
        } catch (error) {
            console.error('Error al cerrar el ticket:', error);
            interaction.reply('❌ Hubo un error al procesar tu solicitud.');
        }
    },
};
