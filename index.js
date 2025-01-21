const {
	Client,
	GatewayIntentBits,
	Partials,
	Collection,
} = require("discord.js");
require('dotenv').config();

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildInvites,
	],
	partials: [
		Partials.User,
		Partials.Message,
		Partials.GuildMember,
		Partials.ThreadMember,
	],
});

const { loadEvents } = require("./src/lib/handlers/eventHandler");
const { loadCommands } = require("./src/lib/handlers/commandHandler");
const { loadPrefixCommands } = require("./src/lib/handlers/prefixCommandHandler");
const { initialize } = require("./src/lib/database/initialize");

const ticketActivityMonitor = require('./src/Jobs/ticketActivityMonitor');

client.commands = new Collection();
client.prefixCommands = new Collection();
client.config = require("./config.json");


["unhandledRejection", "uncaughtException", "uncaughtExceptionMonitor"].forEach(
	(str) => {
		process.on(str, console.error);
	}
);

client
	.login(process.env.DISCORD_TOKEN)
	.then(() => {
		console.log("\x1b[32m%s\x1b[0m", "[discord] connected");
		initialize();
		loadEvents(client);
		loadCommands(client);
		loadPrefixCommands(client);
		ticketActivityMonitor(client);
	})
	.catch((err) => console.log(err));