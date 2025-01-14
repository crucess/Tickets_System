const connection = require("../database/sql");
const fs = require("fs");
const { setTimeout } = require("timers/promises");

async function loadCommands(client) {
	let commandsArray = [];
	// client.application.commands.set(commandsArray)

	const commandsFolders = fs.readdirSync("./src/Commands");
	for (const folder of commandsFolders) {
		const commandFiles = fs
			.readdirSync(`./src/Commands/${folder}`)
			.filter((file) => file.endsWith(".js"));

		for (const file of commandFiles) {
			const commandFile = require(`../../Commands/${folder}/${file}`);
			let permission = commandFile.data.default_member_permissions;
			if (permission == "8") permission = "Administrator";
			if (permission == "8192") permission = "ManageMessages";
			if (permission == "2147483648")
				permission = "UseApplicationCommands";
			connection.query(
				`SELECT * from tickets_bot.commands WHERE name = '${commandFile.data.name}'`,
				(err, results) => {
					if (err) throw err;
					if (results.length <= 0) {
						const sql = `INSERT INTO tickets_bot.commands (name, permission) VALUES 
                    ('${commandFile.data.name}', '${permission}')`;
						connection.query(sql, (err, results) => {
							if (err) throw err;
						});
					}
				}
			);

			client.commands.set(commandFile.data.name, commandFile);
			commandsArray.push(commandFile.data.toJSON());
			continue;
		}
	}
	client.application.commands.set(commandsArray);

	await setTimeout(2000);
	console.log("\x1b[32m%s\x1b[0m", "[Commands] Loaded");
}

module.exports = { loadCommands };