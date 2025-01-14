const connection = require("../../lib/database/sql");
const { setTimeout } = require("timers/promises");

module.exports = {
    name: "messageCreate",
    async execute(message, client) {
        if (!message.content.startsWith(client.config.info.prefix)) return;
        const args = message.content.slice(client.config.info.prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        if (!client.prefixCommands.has(command)) return;
        
        try {
            client.prefixCommands.get(command).execute(message, client, args);
            connection.query(`INSERT INTO tickets_bot.commands_used (guildid, channelid, command, userid) VALUES ('${message.guildId}', '${message.channelId}', '${command}', '${message.author.id}')`, (err) => {
                if (err) throw err;
            });
        } catch (error) {
            console.log(error);
            message.reply('There was an error trying to execute that command!');
        }
            
        await setTimeout(2000);
        message.delete();
    },
};