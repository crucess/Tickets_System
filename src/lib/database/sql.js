const mysql = require('mysql2');
require('dotenv').config(); // Carga las variables de entorno desde el archivo .env

// Configuración de la base de datos desde .env
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  port: process.env.MYSQL_PORT,
  supportBigNumbers: true, // Maneja números grandes
  bigNumberStrings: true,  // Devuelve BIGINT como cadenas
});

module.exports = {
  query: function () {
    const sql_args = [];
    const args = Array.from(arguments);
    const callback = args[args.length - 1];

    pool.getConnection(function (err, connection) {
      if (err) {
        console.error(err);
        return callback(err);
      }

      if (args.length > 2) {
        sql_args.push(...args[1]);
      }

      connection.query(args[0], sql_args, function (err, results) {
        connection.release();
        if (err) {
          console.error(err);
          return callback(err);
        }
        callback(null, results);
      });
    });
  },
};
