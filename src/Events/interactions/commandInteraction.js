const { CommandInteraction, InteractionType, EmbedBuilder } = require("discord.js");
const connection = require("../../lib/database/sql");
const ticketMenuHandler = require('../tickets/ticketMenu'); // Manejador del menú de tickets

module.exports = {
    name: "interactionCreate",
    /**
     *
     * @param {CommandInteraction} interaction
     */
    async execute(interaction, client) {
        const command = client.commands.get(interaction.commandName);
        const ch = client.channels.cache.get(client.config.channels_logging.comandos_usados);

        try {
            if (interaction.isChatInputCommand()) {
                if (!command) {
                    return interaction.reply({
                        content: "This command is outdated!",
                        ephemeral: true,
                    });
                }

                const data = await obtenerDatosServidor(interaction.guild.id);

                const embedpremiumexpired = new EmbedBuilder()
                    .setTitle("❌ Error")
                    .setDescription(`Your premium subscription has expired! Contact crucess to get a new key!`)
                    .setColor(client.config.info.embed.color);

                const embedonlypremium = new EmbedBuilder()
                    .setTitle("❌ Error")
                    .setDescription(`Only premium servers can use this command! Contact crucess to obtain a key!`)
                    .setColor(client.config.info.embed.color);

                if (command.premium) {
                    if (data) {
                        const premiumExpiration = Number(data.premium); // Ensure it's a number
                        if (!isNaN(premiumExpiration) && premiumExpiration <= Date.now()) {
                            return interaction.reply({ embeds: [embedpremiumexpired], ephemeral: true });
                        }
                    } else {
                        return interaction.reply({ embeds: [embedonlypremium], ephemeral: true });
                    }
                }

                connection.query(
                    `INSERT INTO tickets_bot.commands_used (guildid, channelid, command, userid) VALUES (?, ?, ?, ?)`,
                    [interaction.guild.id, interaction.channel.id, interaction.commandName, interaction.user.id],
                    (err) => {
                        if (err) throw err;
                    }
                );
                console.log(`[DiscordAPI] ${Math.round((Date.now()) / 1000)} | Guild:${interaction.guild.id} - Channel:${interaction.channel.id} - UserID:${interaction.user.id} - UserTag:${interaction.user.tag} - ${interaction}`);
				const embedlogs = new EmbedBuilder()
				.setColor(client.config.info.embed.color)
				.setTimestamp()
				.setFooter({
					text: client.config.info.embed.footer,
					iconURL: client.user.displayAvatarURL(),
				})
				.setAuthor({name: `${client.config.info.embed.footer} Commands Logs`}, {iconURL: client.user.displayAvatarURL()})
				.setThumbnail(client.config.info.embed.logo)
				.setDescription(`- **Guild:** \`${interaction.guild.name} | ${interaction.guild.id}\`\n- **Channel:** \`${interaction.channel.name} | ${interaction.channel.id}\`\n- **User:** \`${interaction.user.tag} | ${interaction.user.id}\`\n\n- **Command:** \n\`\`\`js\n${interaction}\`\`\``);
				ch.send({embeds: [embedlogs]});
                await command.execute(interaction, client);
            }

            // Manejar autocomplete
            if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
                await command.autocomplete(interaction, client);
            }

            // Manejar el menú de tickets
            if (interaction.isStringSelectMenu() && interaction.customId === 'ticket-menu') {
                await ticketMenuHandler(interaction, client);
            }

            // Manejar respuesta de modals
            if (interaction.type === InteractionType.ModalSubmit) {
                const ticketModalHandler = require('../tickets/ticketMenu'); // Usamos el mismo manejador para los modals
                await ticketModalHandler.handleModalSubmit(interaction, client);
            }

            if (interaction.isButton()) {
                const ticketPanelHandler = require('../tickets/ticketPanelHandler');
                await ticketPanelHandler(interaction, client);
            }
            
        } catch (error) {
            console.error('Error executing interaction:', error);
            interaction.reply({ content: 'Ha ocurrido un error al ejecutar el comando, prueba de nuevo en unos segundos!', ephemeral: true });
        }
    },
};

async function obtenerDatosServidor(guildID) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM aa_cruces_bots_manager.servers WHERE guildID = ?';
        connection.query(sql, [guildID], (err, results) => {
            if (err) return reject(err);
            resolve(results[0]);
        });
    });
}
