const { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
const connection = require('../../lib/database/sql');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("activate_key")
    .setDescription("Activate a Premium Key")
    .addStringOption(option => option.setName('key').setDescription('The Premium Key to activate').setRequired(true)),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    const key = interaction.options.getString('key');
    const ch = client.channels.cache.get(client.config.channels_logging.premium_activated_log);

    try {
      const keyData = await obtenerClave(key);
      
      if (!keyData) {
        return interaction.reply({
          embeds: [new EmbedBuilder()
            .setTitle("❌ Error")
            .setDescription("The specified key was not found.")
            .setColor(client.config.info.embed.color)]
        });
      }

      if (keyData.activado) {
        return interaction.reply({
          embeds: [new EmbedBuilder()
            .setTitle("❌ Error")
            .setDescription("The key has already been used.")
            .setColor(client.config.info.embed.color)]
        });
      }

      await activarClave(key);
      await activarPremium(interaction.guild.id, keyData.duracion);

      const embedLog = new EmbedBuilder()
      .setDescription(`# ✅ Clave Activada\nLas características premium han sido activadas en \`${interaction.guild.name}\` \`(${interaction.guild.id})\` hasta <t:${Math.round((Date.now() + Number(keyData.duracion)) / 1000)}:F>.`)
      .setColor(client.config.info.embed.color)
      .setTimestamp()

      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setTitle("✅ Key Activated")
          .setDescription(`Premium features have been activated on this server until <t:${Math.round((Date.now() + Number(keyData.duracion)) / 1000)}:F>.`)
          .setColor(client.config.info.embed.color)]
      }) && ch.send({embeds: [embedLog]});

    } catch (error) {
      console.error('Error activando la clave:', error);
      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setTitle("❌ Error")
          .setDescription("There was an error activating the key in the database.")
          .setColor(client.config.info.embed.color)]
      });
    }
  },
};

function obtenerClave(clave) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM aa_cruces_bots_manager.premiumkeys WHERE clave = ?';
    connection.query(sql, [clave], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
}

function activarClave(clave) {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE aa_cruces_bots_manager.premiumkeys SET activado = 1 WHERE clave = ?';
    connection.query(sql, [clave], (err, results) => {
      if (err) return reject(err);
      resolve(results.affectedRows);
    });
  });
}

function activarPremium(guildId, duracion) {
    return new Promise((resolve, reject) => {
      const selectSql = 'SELECT * FROM aa_cruces_bots_manager.servers WHERE guildID = ?';
      connection.query(selectSql, [guildId], (err, results) => {
        if (err) return reject(err);
        
        if (results.length === 0) {
          // Si no hay ninguna fila para el guildID, inserta una nueva fila
          const insertSql = 'INSERT INTO aa_cruces_bots_manager.servers (guildID, premium) VALUES (?, ?)';
          connection.query(insertSql, [guildId, Math.round(Date.now() + Number(duracion))], (err, results) => {
            if (err) return reject(err);
            resolve(results.affectedRows);
          });
        } else {
          // Si ya existe una fila para el guildID, actualiza la fila existente
          const updateSql = 'UPDATE aa_cruces_bots_manager.servers SET premium = ? WHERE guildID = ?';
          const premiumEnd = Math.round(Date.now() + Number(duracion));
          connection.query(updateSql, [premiumEnd, guildId], (err, results) => {
            if (err) return reject(err);
            resolve(results.affectedRows);
          });
        }
      });
    });
  }