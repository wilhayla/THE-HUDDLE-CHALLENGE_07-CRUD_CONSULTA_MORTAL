// importar el archivo database.js para establecer la conexión
const db = require('../database');

// Función para crear la tabla
function crearTabla() {

  // db.serialize() asegura la ejecución secuencial de las consultas
    db.serialize(() => {
      db.run(
        `
        CREATE TABLE IF NOT EXISTS usuarios (
        id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
        UUID TEXT NOT NULL
        );
        `, (err) => {
          if (err) {
            console.error('Error al crear la tabla "usuarios":', err.message);
          } else {
            console.log('Tabla "usuarios" creada existosamente.');
          }
        }
      );

      db.run(
        `
        CREATE TABLE IF NOT EXISTS temas (
        id_tema INTEGER PRIMARY KEY AUTOINCREMENT,
        id_usuario INTEGER NOT NULL,
        titulo_tema TEXT NOT NULL,
        voto_tema INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)

        );
        `, (err) => {
          if (err) {
            console.error('Error al crear la tabla "temas":', err.message);
          } else {
            console.log('Tabla "temas" creada existosamente.');
          }
        }
      );

      db.run(
        `
        CREATE TABLE IF NOT EXISTS votos_temas (
        id_voto_tema INTEGER PRIMARY KEY AUTOINCREMENT,
        id_tema INTEGER NOT NULL,
        id_usuario INTEGER NOT NULL,
        FOREIGN KEY (id_tema) REFERENCES temas(id_tema),
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
        );
        `, (err) => {
          if (err) {
            console.error('Error al crear la tabla "votos_temas":', err.message);
          } else {
            console.log('Tabla "temas" creada existosamente.');
          }
        }
      );
      db.run(
        `
        CREATE TABLE IF NOT EXISTS enlaces (
        id_enlace INTEGER PRIMARY KEY AUTOINCREMENT,
        id_tema INTEGER NOT NULL,
        URL TEXT NOT NULL,
        Descripcion TEXT,
        id_usuario INTEGER NOT NULL,
        voto_enlace INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (id_tema) REFERENCES temas(id_tema),
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
        );
        `, (err) => {
          if (err) {
            console.error('Error al crear la tabla "enlaces":', err.message);
          } else {
            console.log('Tabla "enlaces" creada existosamente.');
          }
        }
      );
      db.run(
        `
        CREATE TABLE IF NOT EXISTS votos_enlaces (
        id_voto_enlace INTEGER PRIMARY KEY AUTOINCREMENT,
        id_enlace INTEGER NOT NULL,
        id_usuario INTEGER NOT NULL,
        FOREIGN KEY (id_enlace) REFERENCES enlaces(id_enlace),
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
        );
        `, (err) => {
          if (err) {
            console.error('Error al crear la tabla "votos_enlaces":', err.message);
          } else {
            console.log('Tabla "votos_enlaces" creada existosamente.');
          }
        }
      );
    });
    
}

exports.crearTabla = crearTabla;
