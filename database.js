// establece conexión a la base de datos SQLite

const sqlite3 = require('sqlite3').verbose();   // Importa el módulo sqlite3

// Crea una nueva instancia de la base de datos SQLite

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite.');
        // Habilitar la restricción de claves foráneas
        db.run('PRAGMA foreign_keys = ON;', (err) => {
            if (err) {
                console.error('Error al habilitar foreign keys:', err.message);
            } else {
                console.log('Foreign keys habilitadas.');
            }
        });
    }
});

module.exports = db; // Exporta la instancia de la base de datos para usarla en otros módulos
