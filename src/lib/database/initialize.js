const { setTimeout } = require("timers/promises");
const { cruces_database } = require("./schemas/cruces");
const { cruces_commands_used } = require("./tables/commands_used");
const { cruces_commands } = require("./tables/commands");
const { cruces_tickets_users, cruces_tickets_tickets, cruces_tickets_categories, cruces_tickets_logs, cruces_tickets_panels, cruces_tickets_stats } = require("./tables/tickets");

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
	const table_tickets_users = await cruces_tickets_users().catch((err) =>
		console.log(err)
	);
	const table_tickets_tickets = await cruces_tickets_tickets().catch((err) =>
		console.log(err)
	);
	const table_tickets_categories = await cruces_tickets_categories().catch((err) =>
		console.log(err)
	);
	const table_tickets_logs = await cruces_tickets_logs().catch((err) =>
		console.log(err)
	);
	const table_tickets_panels = await cruces_tickets_panels().catch((err) =>
		console.log(err)
	);
	const table_tickets_stats = await cruces_tickets_stats().catch((err) =>
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
	if (!table_tickets_users) {
		message((text = "tickets_users"), (x = true));
	} else message((text = "tickets_users"));
	if (!table_tickets_tickets) {
		message((text = "tickets_tickets"), (x = true));
	} else message((text = "tickets_tickets"));
	if (!table_tickets_categories) {
		message((text = "tickets_categories"), (x = true));
	} else message((text = "tickets_categories"));
	if (!table_tickets_logs) {
		message((text = "tickets_logs"), (x = true));
	} else message((text = "tickets_logs"));
	if (!table_tickets_panels) {
		message((text = "tickets_panels"), (x = true));
	} else message((text = "tickets_panels"));
	if (!table_tickets_stats) {
		message((text = "tickets_stats"), (x = true));
	} else message((text = "tickets_stats"));
}

module.exports = { initialize };