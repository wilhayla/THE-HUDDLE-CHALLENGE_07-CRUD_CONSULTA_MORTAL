const db = require('../database');

/**
 * Vota por un tema específico, asegurando que un usuario no pueda votar más de una vez.
 * @param {number} id_tema - El ID del tema a votar.
 * @param {string} uuid - El UUID único del usuario que está votando.
 * @returns {Promise<string>} - Un mensaje de éxito o de error.
 */
function votarTema(id_tema, uuid) {
    return new Promise((resolve, reject) => {
        // 1. Obtener el id_usuario a partir del UUID
        const getUserIdSql = `SELECT id_usuario FROM usuarios WHERE UUID = ?`;
        db.get(getUserIdSql, [uuid], (err, user) => {
            if (err) { // Si hay un error al obtener el usuario (por ejemplo, problema de conexión a la base de datos)
                return reject(err);
            }
            if (!user) {  // si no hay usuario con ese UUID
                return reject(new Error('Usuario no encontrado.')); // Manejar el caso donde el usuario no existe
            }
            const id_usuario = user.id_usuario; // 

            // 2. Verificar si el usuario ya ha votado por este tema
            const checkSql = `SELECT COUNT(*) AS count FROM votos_temas WHERE id_tema = ? AND id_usuario = ?`;
            db.get(checkSql, [id_tema, id_usuario], (err, row) => {
                if (err) {
                    return reject(err);
                }

                if (row.count > 0) {
                    return resolve('El usuario ya ha votado por este tema.');
                }

                // 3. Iniciar una transacción para asegurar que ambas operaciones se completen o ninguna lo haga
                db.serialize(() => { // Usar serialize para asegurar que las operaciones se ejecuten en orden en orden secuencial
                                    // los comandos begin transaction, insert, update y commit se ejecutan en orden
                    db.run("BEGIN TRANSACTION;"); // Iniciar la transacción, si falla alguna de las siguientes operaciones,
                                                  // todos los pasos anteriores dentro de la transacción se cancelarán

                    // 4. Registrar el voto del usuario en la tabla de votos_temas
                    const insertSql = `INSERT INTO votos_temas (id_tema, id_usuario) VALUES (?, ?)`;
                    db.run(insertSql, [id_tema, id_usuario], function(insertErr) {
                        if (insertErr) { // Si hay un error al insertar el voto
                            db.run("ROLLBACK;"); // Revertir la transacción en caso de error
                            return reject(insertErr); // Rechazar la promesa con el error
                        }
                    });

                    // 5. Incrementar el contador de votos en la tabla de temas
                    const updateSql = `UPDATE temas SET voto_tema = voto_tema + 1 WHERE id_tema = ?`;
                    db.run(updateSql, [id_tema], function(updateErr) {
                        if (updateErr) {
                            db.run("ROLLBACK;");
                            return reject(updateErr);
                        }
                    });

                    db.run("COMMIT;", (commitErr) => {
                        if (commitErr) {
                            return reject(commitErr);
                        }
                        resolve('Voto registrado con éxito.');
                    });
                });
            });
        });
    });
}

/**
 * Elimina todos los votos asociados a un tema específico.
 * @param {number} temaId - El ID del tema cuyos votos se van a eliminar.
 * @returns {Promise<void>} Una promesa que se resuelve al completar la eliminación.
 */
function eliminarVotosPorTema(temaId) {
    const sql = `DELETE FROM votos_temas WHERE id_tema = ?`;
    return new Promise((resolve, reject) => {
        db.run(sql, [temaId], function(err) {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}

// Exporta la función para que sea accesible desde otros archivos
module.exports = { votarTema, eliminarVotosPorTema };