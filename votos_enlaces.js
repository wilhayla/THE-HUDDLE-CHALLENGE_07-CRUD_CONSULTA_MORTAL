const db = require('../database');

/**
 * Vota por un enlace, si el usuario no ha votado aún.
 * @param {number} id_enlace - El ID del enlace por el que se está votando.
 * @param {string} UUID - El UUID del usuario que vota.
 * @returns {Promise<string>} Mensaje indicando si el voto fue exitoso o duplicado.
 */
async function votarEnlace(id_enlace, UUID) {
    return new Promise((resolve, reject) => {
        // 1. Obtener el id_usuario a partir del UUID
        const getUserIdSql = `SELECT id_usuario FROM usuarios WHERE UUID = ?`;
        db.get(getUserIdSql, [UUID], (err, user) => {
            if (err) {
                return reject(err);
            }
            if (!user) {
                return reject(new Error('Usuario no encontrado.'));
            }
            const id_usuario = user.id_usuario;

            // 2. Verificar si el usuario ya ha votado por este enlace
            const checkSql = `SELECT COUNT(*) AS count FROM votos_enlaces WHERE id_enlace = ? AND id_usuario = ?`;
            db.get(checkSql, [id_enlace, id_usuario], (err, row) => {
                if (err) {
                    return reject(err);
                }
                if (row.count > 0) {
                    return resolve('El usuario ya ha votado por este enlace.');
                }

                // 3. Iniciar una transacción para asegurar que ambas operaciones se completen o ninguna lo haga
                db.serialize(() => {
                    db.run("BEGIN TRANSACTION;");

                    // 4. Registrar el voto del usuario en la tabla de votos_enlaces
                    const insertSql = `INSERT INTO votos_enlaces (id_enlace, id_usuario) VALUES (?, ?)`;
                    db.run(insertSql, [id_enlace, id_usuario], function(insertErr) {
                        if (insertErr) {
                            db.run("ROLLBACK;");
                            return reject(insertErr);
                        }
                    });

                    // 5. Incrementar el contador de votos en la tabla de enlaces
                    const updateSql = `UPDATE enlaces SET voto_enlace = voto_enlace + 1 WHERE id_enlace = ?`;
                    db.run(updateSql, [id_enlace], function(updateErr) {
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
 * Elimina todos los votos asociados a un enlace.
 * @param {number} id_enlace - El ID del enlace cuyos votos se van a eliminar.
 * @returns {Promise<void>}
 */
function eliminarVotosPorEnlace(id_enlace) {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM votos_enlaces WHERE id_enlace = ?`;
        db.run(sql, [id_enlace], function(err) {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}

module.exports = { votarEnlace, eliminarVotosPorEnlace };