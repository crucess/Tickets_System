const fs = require("fs");
const { setTimeout } = require("timers/promises");

async function loadPrefixCommands(client) {
    const commandFiles = fs.readdirSync('./src/prefixCommands').filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(`../../prefixCommands/${file}`);
        client.prefixCommands.set(command.name, command);
    }

    await setTimeout(2000)
    console.log('\x1b[32m%s\x1b[0m', '[PrefixCommands] Loaded');
}

module.exports = { loadPrefixCommands };