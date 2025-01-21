const express = require('express');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar conexión a la base de datos
const db = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: 'tickets_bot',
});

// Ruta para servir archivos estáticos (frontend)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware de autenticación
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No autorizado' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token inválido' });
        req.user = user;
        next();
    });
};

// Ruta de autenticación (login)
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // Verificar credenciales (reemplazar con lógica real)
    if (username === 'admin' && password === 'admin123') {
        const token = jwt.sign({ username, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.json({ token });
    }

    res.status(401).json({ message: 'Credenciales inválidas' });
});

// Ruta para estadísticas generales
app.get('/api/stats', authenticate, (req, res) => {
    const statsQuery = `
        SELECT 
            (SELECT COUNT(*) FROM tickets_bot.tickets WHERE status = 'open') AS openTickets,
            (SELECT COUNT(*) FROM tickets_bot.tickets WHERE status = 'closed') AS closedTickets,
            (SELECT COUNT(*) FROM tickets_bot.tickets WHERE status = 'abandoned') AS abandonedTickets,
            (SELECT COUNT(DISTINCT user_id) FROM tickets_bot.tickets) AS activeUsers
    `;

    db.query(statsQuery, (err, results) => {
        if (err) {
            console.error('Error al obtener estadísticas:', err);
            return res.status(500).json({ message: 'Error al obtener estadísticas', error: err });
        }
        res.json(results[0]);
    });
});


// Rutas para la gestión de paneles
app.get('/api/panels', authenticate, (req, res) => {
    db.query('SELECT * FROM tickets_bot.panels', (err, results) => {
        if (err) {
            console.error('Error al obtener los paneles:', err);
            return res.status(500).json({ message: 'Error al obtener los paneles', error: err });
        }

        // Asegurarnos de que cada panel tenga un campo `options` parseado correctamente
        const panels = results.map(panel => {
            try {
                panel.options = JSON.parse(panel.options);
            } catch (e) {
                console.warn(`No se pudo parsear el campo options para el panel ID ${panel.id}`);
                panel.options = [];
            }
            return panel;
        });

        res.json(panels);
    });
});


app.post('/api/panels', authenticate, (req, res) => {
    const { channel_id, options } = req.body;

    db.query(
        'INSERT INTO tickets_bot.panels (channel_id, options) VALUES (?, ?)',
        [channel_id, JSON.stringify(options)],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Error al crear el panel', error: err });
            res.json({ message: 'Panel creado con éxito', id: result.insertId });
        }
    );
});

app.put('/api/panels/:id', authenticate, (req, res) => {
    const { id } = req.params;
    const { channel_id, options } = req.body;

    db.query(
        'UPDATE tickets_bot.panels SET channel_id = ?, options = ? WHERE id = ?',
        [channel_id, JSON.stringify(options), id],
        (err) => {
            if (err) return res.status(500).json({ message: 'Error al actualizar el panel', error: err });
            res.json({ message: 'Panel actualizado con éxito' });
        }
    );
});

app.delete('/api/panels/:id', authenticate, (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM tickets_bot.panels WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ message: 'Error al eliminar el panel', error: err });
        res.json({ message: 'Panel eliminado con éxito' });
    });
});


// Iniciar el servidor
const PORT = process.env.DASHBOARD_PORT || 3000;
app.listen(PORT, () => {
    console.log(`Dashboard disponible en http://localhost:${PORT}`);
});
