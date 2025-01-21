const connection = require('../sql');

function cruces_tickets_users() {
    return new Promise((resolve, reject) => {
        const sql = `CREATE TABLE IF NOT EXISTS tickets_bot.users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id VARCHAR(50) NOT NULL UNIQUE,
            username VARCHAR(100) NOT NULL,
            tickets_created INT DEFAULT 0,
            tickets_claimed INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
        connection.query(sql, (err, results) => {
            if (err) reject(err)
            return results.warningCount == "0" ? resolve(0) : resolve(results)
        })
    })
}

function cruces_tickets_tickets() {
    return new Promise((resolve, reject) => {
        const sql = `CREATE TABLE IF NOT EXISTS tickets_bot.tickets (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id VARCHAR(50) NOT NULL,
            username VARCHAR(100) NOT NULL,
            category_id INT NOT NULL,
            channel_id VARCHAR(50) NOT NULL,
            status ENUM('open', 'claimed', 'closed') DEFAULT 'open',
            claimed_by VARCHAR(50) DEFAULT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            closed_at TIMESTAMP NULL
        )`
        connection.query(sql, (err, results) => {
            if (err) reject(err)
            return results.warningCount == "0" ? resolve(0) : resolve(results)
        })
    })
}

function cruces_tickets_categories() {
    return new Promise((resolve, reject) => {
        const sql = `CREATE TABLE IF NOT EXISTS tickets_bot.categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(50) NOT NULL UNIQUE,
            description VARCHAR(255) DEFAULT NULL,
            max_tickets_per_user INT DEFAULT 1,
            discord_category_id BIGINT DEFAULT NULL
        )`
        connection.query(sql, (err, results) => {
            if (err) reject(err)
            return results.warningCount == "0" ? resolve(0) : resolve(results)
        })
    })
}

function cruces_tickets_logs() {
    return new Promise((resolve, reject) => {
        const sql = `CREATE TABLE IF NOT EXISTS tickets_bot.logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            ticket_id INT NOT NULL,
            event_type ENUM('created', 'claimed', 'closed', 'transferred') NOT NULL,
            details TEXT DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
        )`
        connection.query(sql, (err, results) => {
            if (err) reject(err)
            return results.warningCount == "0" ? resolve(0) : resolve(results)
        })
    })
}

function cruces_tickets_panels() {
    return new Promise((resolve, reject) => {
        const sql = `CREATE TABLE IF NOT EXISTS tickets_bot.panels (
            id BIGINT AUTO_INCREMENT PRIMARY KEY, -- Cambia el tipo de datos a BIGINT
            message_id BIGINT NOT NULL,
            channel_id BIGINT NOT NULL,
            options JSON NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
        connection.query(sql, (err, results) => {
            if (err) reject(err)
            return results.warningCount == "0" ? resolve(0) : resolve(results)
        })
    })
}

function cruces_tickets_stats() {
    return new Promise((resolve, reject) => {
        const sql = `CREATE TABLE IF NOT EXISTS tickets_bot.ticket_stats (
            id INT AUTO_INCREMENT PRIMARY KEY,
            panel_id BIGINT NOT NULL, -- Tipo BIGINT para ser compatible con panels.id
            user_id BIGINT NOT NULL,
            ticket_id BIGINT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (panel_id) REFERENCES tickets_bot.panels(id) ON DELETE CASCADE
        )`
        connection.query(sql, (err, results) => {
            if (err) reject(err)
            return results.warningCount == "0" ? resolve(0) : resolve(results)
        })
    })
}
module.exports = { 
    cruces_tickets_users, 
    cruces_tickets_tickets, 
    cruces_tickets_categories, 
    cruces_tickets_logs, 
    cruces_tickets_panels, 
    cruces_tickets_stats 
}