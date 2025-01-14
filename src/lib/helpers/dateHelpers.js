class DateFunctions {
	datediff(first, second) {
		return Math.round((second - first) / (1000 * 60 * 60 * 24));
	}

	nextDay(x) {
		var now = new Date();
		now.setDate(now.getDate() + ((x + (7 - now.getDay())) % 7));
		return now;
	}

	getNextDayOfTheWeek(dayName, excludeToday = true, refDate = new Date()) {
		const dayOfWeek = [
			"sun",
			"mon",
			"tue",
			"wed",
			"thu",
			"fri",
			"sat",
		].indexOf(dayName.slice(0, 3).toLowerCase());
		if (dayOfWeek < 0) return;
		refDate.setHours(0, 0, 0, 0);
		refDate.setDate(
			refDate.getDate() +
				+!!excludeToday +
				((dayOfWeek + 7 - refDate.getDay() - +!!excludeToday) % 7)
		);
		return refDate;
	}

	/**
	 * Turns Date into unix timestamp
	 * @param { Date } date
	 * @returns { number }
	 */
	toUnix(date) {
		return date.getTime() / 1000;
	}

	/**
	 * October 2, 2023 3:27 PM
	 * @param { Date | Number} date
	 * @returns { string }
	 */
	toDiscordTimestampDateTime(date) {
		return typeof date != Number
			? `<t:${date / 1000}:f>`
			: `<t:${this.toUnix(date)}:f>`;
	}

	/**
	 * Monday, October 2, 2023 3:27 PM
	 * @param { Date | Number} date
	 * @returns { string }
	 */
	toDiscordTimestampDateTimeDay(date) {
		return typeof date != Number
			? `<t:${date / 1000}:F>`
			: `<t:${this.toUnix(date)}:F>`;
	}

	/**
	 * 2 minutes ago
	 * @param { Date | Number} date
	 * @returns { string }
	 */
	toDiscordTimestampTimeUntil(date) {
		return typeof date != Number
			? `<t:${date / 1000}:R>`
			: `<t:${this.toUnix(date)}:R>`;
	}

	/**
	 * 3:27:00 PM
	 * @param { Date | Number } date
	 * @returns { string }
	 */
	toDiscordTimestampTimeMinutes(date) {
		return typeof date != Number
			? `<t:${date / 1000}:T>`
			: `<t:${this.toUnix(date)}:T>`;
	}

	/**
	 * 3:27 PM
	 * @param { Date | Number } date
	 * @returns { string }
	 */
	toDiscordTimestampTime(date) {
		return typeof date != Number
			? `<t:${date / 1000}:t>`
			: `<t:${this.toUnix(date)}:t>`;
	}

	/**
	 * 10/02/2023
	 * @param { Date | Number} date
	 * @returns { string }
	 */
	toDiscordTimestampDate(date) {
		return typeof date != Number
			? `<t:${date / 1000}:d>`
			: `<t:${this.toUnix(date)}:d>`;
	}

	/**
	 * October 2, 2023
	 * @param { Date | Number } date
	 * @returns { string }
	 */
	toDiscordTimestampDateMonth(date) {
		return typeof date != Number
			? `<t:${date / 1000}:D>`
			: `<t:${this.toUnix(date)}:D>`;
	}
}

module.exports = { DateFunctions };