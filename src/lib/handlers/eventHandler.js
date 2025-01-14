const fs = require("fs");
const { setTimeout } = require("timers/promises");

async function loadEvents(client) {
	const folders = fs.readdirSync("./src/Events/");
	for (const folder of folders) {
		const files = fs
			.readdirSync(`./src/Events/${folder}/`)
			.filter((file) => file.endsWith(".js"));
		for (const file of files) {
			const event = require(`../../Events/${folder}/${file}`);
			if (event.rest) {
				if (event.once)
					client.rest.once(event.name, (...args) =>
						event.execute(...args, client)
					);
				else
					client.rest.on(event.name, (...args) =>
						event.execute(...args, client)
					);
			} else {
				if (event.once)
					client.once(event.name, (...args) =>
						event.execute(...args, client)
					);
				else
					client.on(event.name, (...args) =>
						event.execute(...args, client)
					);
			}
			continue;
		}
	}

	await setTimeout(2000);
	console.log("\x1b[32m%s\x1b[0m", "[Events] Loaded");
}

module.exports = { loadEvents };