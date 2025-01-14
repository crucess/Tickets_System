const connection = require('../sql');

function cruces_commands_used() {
    return new Promise((resolve, reject) => {
        const sql = `CREATE TABLE IF NOT EXISTS tickets_bot.commands_used (
            id BIGINT(20) AUTO_INCREMENT,
            guildid VARCHAR(255),
            channelid VARCHAR(255),
            command VARCHAR(255),
            userid VARCHAR(255),
            primary key (id)
        )`
        connection.query(sql, (err, results) => {
            if (err) reject(err)
            return results.warningCount == "0" ? resolve(0) : resolve(results)
        })
    })
}
module.exports = { cruces_commands_used }