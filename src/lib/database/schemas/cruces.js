const connection = require('../sql');

function cruces_database() {
    return new Promise((resolve, reject) => {
        const sql = `CREATE DATABASE IF NOT EXISTS tickets_bot`
        connection.query(sql, (err, results) => {
            if (err) reject(err)
            return results.warningCount == "0" ? resolve(0) : resolve(results)
        })
    })
}
module.exports = { cruces_database }