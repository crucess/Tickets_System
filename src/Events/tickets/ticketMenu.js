const { ChannelType, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../lib/database/sql');

module.exports = async (interaction, client) => {
    const selectedCategory = interaction.values[0];
    console.log(`Categoría seleccionada: ${selectedCategory}`);

    try {
        db.query('SELECT id, discord_category_id, max_tickets_per_user FROM tickets_bot.categories WHERE LOWER(name) = ?', [selectedCategory.toLowerCase()], async (err, results) => {
            if (err || results.length === 0) {
                console.error('Error al obtener la categoría:', err || 'No se encontró la categoría.');
                return interaction.reply('❌ No se encontró una categoría asociada a esta opción.');
            }

            const categoryId = results[0].id;
            const discordCategoryId = results[0].discord_category_id;
            const maxTicketsPerUser = results[0].max_tickets_per_user;
            const guild = interaction.guild;

            const categoryChannel = guild.channels.cache.get(discordCategoryId);
            if (!categoryChannel || categoryChannel.type !== ChannelType.GuildCategory) {
                console.error(`La categoría con ID ${discordCategoryId} no existe o no es válida en este servidor.`);
                return interaction.reply('⚠️ La categoría configurada no existe o no es válida.');
            }

            // Verificar cuántos tickets abiertos tiene el usuario en esta categoría
            db.query(
                `SELECT COUNT(*) AS openTickets FROM tickets_bot.tickets WHERE user_id = ? AND category_id = ? AND status = 'open'`,
                [interaction.user.id, categoryId],
                async (err, results) => {
                    if (err) {
                        console.error('Error al verificar tickets abiertos:', err);
                        return interaction.reply('❌ Hubo un error al verificar tus tickets abiertos.');
                    }

                    const openTickets = results[0].openTickets;

                    if (openTickets >= maxTicketsPerUser) {
                        return interaction.reply(`⚠️ Ya tienes ${openTickets} ticket(s) abierto(s) en la categoría **${selectedCategory}**. El límite es ${maxTicketsPerUser} ticket(s).`);
                    }

                    // Crear el modal con preguntas específicas para la categoría
                    const modal = new ModalBuilder()
                        .setCustomId(`ticket-modal-${selectedCategory}`)
                        .setTitle(`Formulario de ${selectedCategory}`);

                    const questions = {
                        support: [
                            { label: 'Describe tu problema', style: TextInputStyle.Paragraph, id: 'problem-description' },
                            { label: '¿Cuál es tu sistema operativo?', style: TextInputStyle.Short, id: 'os-info' },
                        ],
                        donation: [
                            { label: 'Cantidad donada', style: TextInputStyle.Short, id: 'donation-amount' },
                            { label: 'Método de pago', style: TextInputStyle.Short, id: 'payment-method' },
                        ],
                    };

                    const inputs = questions[selectedCategory.toLowerCase()] || [];
                    const actionRows = inputs.map(input =>
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId(input.id)
                                .setLabel(input.label)
                                .setStyle(input.style)
                                .setRequired(true)
                        )
                    );

                    modal.addComponents(...actionRows);

                    // Mostrar el modal al usuario
                    interaction.showModal(modal);
                }
            );
        });
    } catch (error) {
        console.error('Error al manejar el menú de tickets:', error);
        interaction.reply('❌ Hubo un error al procesar tu solicitud.');
    }
};

// Manejo de la respuesta al modal
module.exports.handleModalSubmit = async (interaction, client) => {
    if (!interaction.isModalSubmit()) return;

    const customId = interaction.customId;
    if (!customId.startsWith('ticket-modal-')) return;

    const selectedCategory = customId.replace('ticket-modal-', '').toLowerCase();

    try {
        const inputs = interaction.fields.fields.map(field => ({
            id: field.customId,
            value: field.value,
        }));

        db.query('SELECT id, discord_category_id FROM tickets_bot.categories WHERE LOWER(name) = ?', [selectedCategory], async (err, results) => {
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

            // Crear el canal del ticket con las respuestas del modal
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

            const description = inputs.map(input => `**${input.id.replace(/-/g, ' ')}**: ${input.value}`).join('\n');

            db.query(
                `INSERT INTO tickets_bot.tickets (user_id, username, category_id, channel_id, description)
     VALUES (?, ?, ?, ?, ?)`,
                [interaction.user.id, interaction.user.tag, categoryId, channel.id, description],
                async (err, result) => {
                    if (err) {
                        console.error('Error al registrar el ticket:', err);
                        return interaction.reply('❌ Hubo un error al registrar el ticket en la base de datos.');
                    }

                    const ticketId = result.insertId; // Obtener la ID del ticket recién creado

                    // Crear un embed con la información del ticket
                    const embed = new EmbedBuilder()
                        .setTitle('🎫 Nuevo Ticket Creado')
                        .setColor('DarkButNotBlack')
                        .addFields(
                            { name: '🆔 Ticket ID', value: `#${ticketId}`, inline: true },
                            { name: '👤 Usuario', value: `<@${interaction.user.id}> (${interaction.user.tag})`, inline: true },
                            { name: '📂 Categoría', value: selectedCategory, inline: true },
                            { name: '📄 Respuestas', value: description || 'Sin información adicional', inline: false },
                        )
                        .setFooter({ text: client.config.info.embed.footer, iconURL: client.user.displayAvatarURL() })
                        .setTimestamp();

                    // Enviar el mensaje al canal del ticket
                    await channel.send({
                        content: `👤 Ticket creado por <@${interaction.user.id}>.`,
                        embeds: [embed],
                    });

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
