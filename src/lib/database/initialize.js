const { setTimeout } = require("timers/promises");
const { cruces_database } = require("./schemas/cruces");
const { cruces_commands_used } = require("./tables/commands_used");
const { cruces_commands } = require("./tables/commands");

async function initialize() {
	const database = await cruces_database().catch((err) => 
		console.log(err)
	);
	const table_commands = await cruces_commands().catch((err) =>
		console.log(err)
	);
	const table_commands_used = await cruces_commands_used().catch((err) =>
		console.log(err)
	);

	function message(text, x, y) {
		if (y)
			return !x
				? console.log("\x1b[32m%s\x1b[0m", `[database][${text}] found.`)
				: console.log(
						"\x1b[33m%s\x1b[0m",
						`[database][${text}] not found. Creating one now.`
				  );
		if (x)
			return console.log(
				"\x1b[33m%s\x1b[0m",
				`[table][${text}] not found. Creating one now.`
			);
		else return console.log("\x1b[32m%s\x1b[0m", `[table][${text}] found.`);
	}
	await setTimeout(500);

	if (!database) {
		return message((text = "tickets_bot"), (x = true), (y = true));
	} else message((text = "tickets_bot"), (x = false), (y = true));
	if (!table_commands) {
		message((text = "commands"), (x = true));
	} else message((text = "commands"));
	if (!table_commands_used) {
		message((text = "commands_used"), (x = true));
	} else message((text = "commands_used"));
}

module.exports = { initialize };