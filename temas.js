const db = require('../database');

/**
 * Crea un nuevo tema asociado a un usuario.
 * @param {number} id_usuario - El ID del usuario que crea el tema.
 * @param {string} titulo_tema - El título del tema.
 * @returns {Promise<number>} - El ID del tema recién creado.
 */
function crearTema(id_usuario, titulo_tema) {
  return new Promise((resolve, reject) => {     // Retorna una promesa positiva(resolve) o negativa(reject) si hay error.
    const sql = `INSERT INTO temas (id_usuario, titulo_tema) VALUES (?, ?)`; // Consulta SQL para insertar un nuevo tema.
    db.run(sql, [id_usuario, titulo_tema], function(err) { // Ejecuta la consulta con los parámetros proporcionados.
      if (err) {
        return reject(err); // Rechaza la promesa si hay un error.
      }
      resolve(this.lastID); // Resuelve la promesa con el ID del tema recién creado.
    });
  });
}

/**
 * Obtiene todos los temas de la base de datos, ordenados por votos.
 * @returns {Promise<Array<Object>>} - Un array de objetos con los temas.
 */
function obtenerTodosLosTemas() {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM temas ORDER BY voto_tema DESC`;
    db.all(sql, [], (err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
}

/**
 * Elimina un tema por su ID.
 * @param {number} temaId - El ID del tema a eliminar.
 * @returns {Promise<number>} - Una promesa que se resuelve con el número de filas eliminadas.
 */
function eliminarTema(temaId) {
    const sql = `DELETE FROM temas WHERE id_tema = ?`;
    return new Promise((resolve, reject) => {
        db.run(sql, [temaId], function(err) {
            if (err) {
                console.error(`Error al eliminar el tema con ID ${temaId}:`, err.message);
                return reject(err);
            }
            console.log(`Tema con ID ${temaId} eliminado. Filas afectadas: ${this.changes}`);
            resolve(this.changes); // Número de filas eliminadas
        });
    });
}

/**
 * Edita el título de un tema.
 * @param {number} temaId - El ID del tema a editar.
 * @param {string} nuevoTitulo - El nuevo título del tema.
 * @returns {Promise<number>} - Una promesa que se resuelve con el número de filas modificadas.
 */
function editarTema(temaId, nuevoTitulo) {
    const sql = `UPDATE temas SET titulo_tema = ? WHERE id_tema = ?`;
    return new Promise((resolve, reject) => {
        db.run(sql, [nuevoTitulo, temaId], function(err) {
            if (err) {
                console.error(`Error al editar el tema con ID ${temaId}:`, err.message);
                return reject(err);
            }
            console.log(`Tema con ID ${temaId} editado. Filas modificadas: ${this.changes}`);
            resolve(this.changes);
        });
    });
}

// Exporta las funciones
module.exports = { 
  crearTema,
  obtenerTodosLosTemas,
  eliminarTema,
  editarTema 
};