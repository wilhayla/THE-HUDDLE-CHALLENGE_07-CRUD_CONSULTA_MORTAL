const db = require('../database');

/**
 * Crea un nuevo enlace para un tema específico.
 * @param {number} id_tema - El ID del tema al que se le agrega el enlace.
 * @param {string} url - El URL del enlace.
 * @param {string} descripcion - La descripción del enlace.
 * @param {number} id_usuario - El ID del usuario que agrega el enlace.
 * @returns {Promise<void>}
 */
function crearEnlace(id_tema, url, descripcion, id_usuario) {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO enlaces (id_tema, url, descripcion, id_usuario) VALUES (?, ?, ?, ?)`;
        db.run(sql, [id_tema, url, descripcion, id_usuario], function(err) {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}

/**
 * Obtiene todos los enlaces para un tema específico.
 * @param {number} id_tema - El ID del tema.
 * @returns {Promise<Array>} Una promesa que se resuelve con un array de objetos de enlaces.
 */
function obtenerEnlacesPorTema(id_tema) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT id_enlace, url, descripcion, voto_enlace FROM enlaces WHERE id_tema = ? ORDER BY voto_enlace DESC`;
        db.all(sql, [id_tema], (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}

/**
 * Elimina un enlace específico.
 * @param {number} id_enlace - El ID del enlace que se va a eliminar.
 * @returns {Promise<void>}
 */
function eliminarEnlace(id_enlace) {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM enlaces WHERE id_enlace = ?`;
        db.run(sql, [id_enlace], function(err) {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}

/**
 * Actualiza la URL y la descripción de un enlace específico.
 * @param {number} id_enlace - El ID del enlace a actualizar.
 * @param {string} nuevaUrl - La nueva URL del enlace.
 * @param {string} nuevaDescripcion - La nueva descripción del enlace.
 * @returns {Promise<void>}
 */
function actualizarEnlace(id_enlace, nuevaUrl, nuevaDescripcion) {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE enlaces SET url = ?, descripcion = ? WHERE id_enlace = ?`;
        db.run(sql, [nuevaUrl, nuevaDescripcion, id_enlace], function(err) {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}

/**
 * Elimina todos los enlaces de un tema.
 * @param {number} id_tema - El ID del tema.
 * @returns {Promise<void>}
 */
function eliminarEnlacesPorTema(id_tema) {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM enlaces WHERE id_tema = ?`;
        db.run(sql, [id_tema], function(err) {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}

module.exports = { crearEnlace, obtenerEnlacesPorTema, eliminarEnlace, actualizarEnlace, eliminarEnlacesPorTema };