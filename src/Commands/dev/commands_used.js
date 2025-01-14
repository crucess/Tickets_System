const { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder, WebhookClient } = require("discord.js");
const connection = require("../../lib/database/sql");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('commands_used')
        .setDescription('Shows the list of commands and their usage count')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        premium: true,

    async execute(interaction, client) {
        try {
            connection.query('USE tickets_bot', (err) => {
                if (err) {
                    console.error('Error selecting database:', err);
                    return interaction.reply({ content: 'There was an error processing your request.', ephemeral: true });
                }

                // Consulta para obtener el recuento de uso de comandos
                const sql = 'SELECT command, COUNT(*) AS usage_count FROM commands_used GROUP BY command';
                connection.query(sql, (err, rows) => {
                    if (err) {
                        console.error('Error fetching command usage data:', err);
                        return interaction.reply({ content: 'There was an error processing your request.', ephemeral: true });
                    }

                    let response = '**Commands Usage:**\n\n';
                    rows.forEach(row => {
                        response += `${row.command} (${row.usage_count})\n`;
                    });

                    interaction.reply({ content: response, ephemeral: true });
                });
            });
        } catch (error) {
            console.error('Error fetching command usage data:', error);
            await interaction.reply({ content: 'There was an error processing your request.', ephemeral: true });
        }
    },
};