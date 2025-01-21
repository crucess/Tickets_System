const { ChannelType } = require('discord.js');
const db = require('../../lib/database/sql');

module.exports = async (interaction, client) => {
    if (!interaction.isModalSubmit()) return;

    const customId = interaction.customId;
    if (!customId.startsWith('ticket-modal-')) return;

    const selectedCategory = customId.replace('ticket-modal-', '').toLowerCase();

    try {
        // Obtener datos del modal
        const inputs = interaction.fields.fields.map(field => ({
            id: field.customId,
            value: field.value,
        }));

        const categoryIdQuery = 'SELECT id, discord_category_id FROM tickets_bot.categories WHERE LOWER(name) = ?';
        db.query(categoryIdQuery, [selectedCategory], async (err, results) => {
            if (err || results.length === 0) {
                console.error('Error al obtener la categoría:', err || 'No se encontró la categoría.');
                return interaction.reply('❌ No se encontró una categoría asociada.');
            }

            const categoryId = results[0].id;
            const discordCategoryId = results[0].discord_category_id;

            const guild = interaction.guild;
            const categoryChannel = guild.channels.cache.get(discordCategoryId);

            if (!categoryChannel || categoryChannel.type !== ChannelType.GuildCategory) {
                console.error(`La categoría con ID ${discordCategoryId} no existe o no es válida.`);
                return interaction.reply('⚠️ La categoría configurada no es válida.');
            }

            // Crear el canal del ticket
            const channelName = `${selectedCategory}-${interaction.user.username}`;
            const channel = await guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: discordCategoryId,
                topic: `Ticket creado por ${interaction.user.tag}`,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: ['ViewChannel'],
                    },
                    {
                        id: interaction.user.id,
                        allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
                    },
                ],
            });

            console.log(`✅ Canal de ticket creado: ${channel.name}`);

            // Registrar el ticket y respuestas en la base de datos
            const description = inputs.map(input => `${input.id}: ${input.value}`).join('\n');
            db.query(
                `INSERT INTO tickets_bot.tickets (user_id, username, category_id, channel_id, description)
                 VALUES (?, ?, ?, ?, ?)`,
                [interaction.user.id, interaction.user.tag, categoryId, channel.id, description],
                (err, result) => {
                    if (err) {
                        console.error('Error al registrar el ticket:', err);
                        return interaction.reply('❌ Hubo un error al registrar el ticket en la base de datos.');
                    }

                    console.log(`✅ Ticket registrado en la base de datos con descripción:\n${description}`);
                }
            );

            interaction.reply({
                content: `✅ Ticket creado correctamente en la categoría **${categoryChannel.name}**: <#${channel.id}>`,
                ephemeral: true,
            });
        });
    } catch (error) {
        console.error('Error al procesar el modal:', error);
        interaction.reply('❌ Hubo un error al procesar tu solicitud.');
    }
};
