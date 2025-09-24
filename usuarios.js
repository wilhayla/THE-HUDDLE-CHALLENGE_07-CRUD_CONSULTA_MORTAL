// models/usuarios.js
const db = require('../database');

/**
 * Crea un nuevo usuario en la base de datos con un UUID dado.
 * @param {string} UUID - El identificador único del usuario.
 * @returns {Promise<number>} - El ID del usuario recién creado.
 */
function crearUsuario(UUID) {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO usuarios (UUID) VALUES (?)`;
    db.run(sql, [UUID], function(err) {
      if (err) {
        // En caso de error, rechaza la promesa
        return reject(err);
      }
      // En caso de éxito, resuelve la promesa con el ID de la nueva fila
      resolve(this.lastID);
    });
  });
}

/**
 * Obtiene el ID de un usuario a partir de su UUID, o crea un nuevo usuario si no existe.
 * @param {string} UUID - El UUID único del usuario.
 * @returns {Promise<number>} - El ID del usuario existente o recién creado.
 */
function obtenerOCrearUsuario(UUID) {
    return new Promise((resolve, reject) => {
        // Buscar el usuario existente por su UUID
        db.get('SELECT id_usuario FROM usuarios WHERE UUID = ?', [UUID], (err, row) => {
            if (err) {
                return reject(err);
            }
            if (row) { 
                // Si el usuario existe, resolver con su ID
                resolve(row.id_usuario);
            } else {
                // Si no existe, crearlo y luego resolver con el nuevo ID
                crearUsuario(UUID)
                    .then(id => resolve(id)) // Resuelve con el ID del nuevo usuario
                    .catch(err => reject(err)); // Rechaza en caso de error al crear
            }
        });
    });
}

/**
 * Obtiene un usuario por su UUID.
 * @param {string} UUID - El UUID del usuario.
 * @returns {Promise<Object>} Un objeto con los datos del usuario o null si no se encuentra.
 */
function obtenerUsuarioPorUUID(UUID) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT id_usuario, UUID FROM usuarios WHERE UUID = ?`;
        db.get(sql, [UUID], (err, row) => {
            if (err) {
                return reject(err);
            }
            resolve(row);
        });
    });
}

module.exports = { crearUsuario, obtenerOCrearUsuario, obtenerUsuarioPorUUID };