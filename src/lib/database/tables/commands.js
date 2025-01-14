const connection = require('../sql');

function cruces_commands() {
    return new Promise((resolve, reject) => {
        const sql = `CREATE TABLE IF NOT EXISTS tickets_bot.commands (
            id BIGINT(20) AUTO_INCREMENT,
            name VARCHAR(255),
            permission VARCHAR(255),
            primary key (id)
        )`
        connection.query(sql, (err, results) => {
            if (err) reject(err)
            return results.warningCount == "0" ? resolve(0) : resolve(results)
        })
    })
}
module.exports = { cruces_commands }