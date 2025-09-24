
const { obtenerOCrearUsuario, obtenerUsuarioPorUUID } = require('../models/usuarios'); // Importa las funciones del modelo de usuarios
const { crearTema, obtenerTodosLosTemas, eliminarTema:eliminarTemaDB, editarTema:editarTemaDB } = require('../models/temas'); // Importa las funciones del modelo de temas
const { votarTema:votarTemaDB, eliminarVotosPorTema:eliminarVotosPorTemaDB } = require('../models/votos_temas'); // Importa las funciones del modelo de votos_temas
const { votarEnlace:votarVotoEnlaceDB, eliminarVotosPorEnlace:eliminarVotosPorEnlaceDB } = require('../models/votos_enlaces'); // Importa las funciones del modelo de votos_enlaces
const { crearEnlace, obtenerEnlacesPorTema, eliminarEnlace:eliminarEnlaceDB, actualizarEnlace, eliminarEnlacesPorTema:eliminarEnlacesPorTemaDB } = require('../models/enlaces'); // Importa las funciones del modelo de enlaces

// Controlador para la página principal
const renderizarIndex = async (req, res) => {
    try {
        const temas = await obtenerTodosLosTemas();

        for (const tema of temas) {
            tema.enlaces = await obtenerEnlacesPorTema(tema.id_tema);
        }

        res.render('index', { temas });
    } catch (err) {
        res.status(500).send('Error al renderizar la página principal');
    }
};

// Controlador para crear un usuario y un tema
const crearTemaUsuario = async (req, res) => {
    try {
        // Extrae los datos del cuerpo de la solicitud (requiere body-parser)
        const { UUID, titulo_tema } = req.body;

        if (!UUID || !titulo_tema) {
            return res.status(400).send('Faltan datos de usuario o tema.');
        }

        // 1. Crea el usuario
        const id_usuario = await obtenerOCrearUsuario(UUID);

        // 2. Crea el tema usando el ID del usuario recién creado
        await crearTema(id_usuario, titulo_tema);
        
        // Redirige a la página principal para ver el tema en la lista
        res.redirect('/');

    } catch (err) {
        console.error('Error en el controlador:', err.message);
        res.status(500).send('Ocurrió un error al crear el usuario y el tema.');
    }
};

/**
 * Endpoint para eliminar un tema.
 * Se accede a través de una petición POST para mayor compatibilidad con formularios HTML.
 */
const eliminarTema = async (req, res) => {
    const temaId= req.params.id;
    try {
        // 1. Obtener todos los enlaces del tema
        const enlaces = await obtenerEnlacesPorTema(temaId);

        // 2. Eliminar los votos de cada enlace
        for (const enlace of enlaces) {
            await eliminarVotosPorEnlaceDB(enlace.id_enlace);
        }

        // 3. Eliminar todos los enlaces del tema
        await eliminarEnlacesPorTemaDB(temaId);

        // 4. Eliminar los votos del tema principal
        await eliminarVotosPorTemaDB(temaId);
        
        // 5. Luego, elimina el tema principal
        await eliminarTemaDB(temaId);

        res.status(204).end(); // respuesta de exito sin contenido

    } catch (err) {
        console.error(`Error al eliminar el tema con ID ${temaId}:`, err);
        res.status(500).send('Error al eliminar el tema.');
    }
};

/**
 * Endpoint para editar un tema.
 * Toma el ID del tema y el nuevo título del cuerpo de la petición.
 */
const editarTema = async (req, res) => {
    const temaId = req.params.id;
    const nuevoTitulo = req.body.nuevo_titulo;

    console.log(`[DEBUG] Recibida solicitud PUT para editar tema.`);
    console.log(`[DEBUG] ID de tema recibido:`, temaId);
    console.log(`[DEBUG] Nuevo título recibido:`, nuevoTitulo);
    console.log(`[DEBUG] Contenido completo del cuerpo de la petición:`, req.body);

    if (!temaId || !nuevoTitulo) {
        return res.status(400).send('ID del tema y nuevo título son requeridos.');
    }
    
    try {
        // Usa la función importada directamente
        await editarTemaDB(temaId, nuevoTitulo);
        res.status(200).end()
    } catch (err) {
        console.error(`Error al editar el tema con ID ${temaId}:`, err);
        res.status(500).send('Error al editar el tema.');
    }
};

/**
 * Endpoint para votar por un tema.
 */
const votarTema = async (req, res) => {
    const id = req.params.id;
    const { UUID } = req.body
    try {
        const mensaje = await votarTemaDB(id, UUID);
        res.status(200).json({ message: mensaje })
        
    } catch (err) {
        console.error(`Error al votar por el tema con ID ${id}:`, err);
        res.status(500).send('Error al votar por el tema.');
    }
};

// Controlador para agregar un enlace a un tema
const agregarEnlace = async (req, res) => {
    try {
        const id_tema = req.params.id;
        const { url, descripcion, UUID } = req.body;
        
        if (!id_tema || !url || !UUID) {
            return res.status(400).send('Faltan datos de tema, URL o UUID de usuario.');
        }

        const usuario = await obtenerUsuarioPorUUID(UUID);
        if (!usuario) {
            return res.status(404).send('Usuario no encontrado.');
        }
        
        await crearEnlace(id_tema, url, descripcion, usuario.id_usuario);

        res.redirect('/');

    } catch (err) {
        console.error('Error al agregar el enlace:', err);
        res.status(500).send('Ocurrió un error al agregar el enlace.');
        
    }
};

// Controlador para eliminar un enlace
const eliminarEnlace = async (req, res) => {
    const idEnlace = req.params.enlaceId
    try {
        await eliminarVotosPorEnlaceDB(idEnlace);
        await eliminarEnlaceDB(idEnlace);
        res.status(204).end();
    } catch (err) {
        console.error(`Error al eliminar el enlace con ID ${idEnlace}:`, err);
        res.status(500).send('Error al eliminar el enlace.');
    }
};

// Controlador para editar un enlace
const editarEnlace = async (req, res) => {
    const { enlaceId } = req.params
    const { nueva_url, nueva_descripcion } = req.body;
    if (!enlaceId || !nueva_url) {
        return res.status(400).send('ID del enlace y nueva URL son requeridos.');
    }
    try {
        await actualizarEnlace(enlaceId, nueva_url, nueva_descripcion);
        res.status(200).json({ message: 'Enlace actualizado exitosamente.' });
    } catch (err) {
        console.error(`Error al editar el enlace con ID ${id_enlace}:`, err);
        res.status(500).send('Error al editar el enlace.');
    }
};

// Controlador para votar por un enlace
const votarEnlace = async (req, res) => {
    const { enlaceId } = req.params;
    const { UUID } = req.body;
    try {
        const mensaje = await votarVotoEnlaceDB(enlaceId, UUID);
        console.log(mensaje);
        res.status(200).json({ message: mensaje });
    } catch (err) {
        console.error(`Error al votar por el enlace con ID ${enlaceId}:`, err);
        res.status(500).send('Error al votar por el enlace.');
    }
};

// Exporta las funciones para usarlas en las rutas
module.exports = {
    renderizarIndex,
    crearTemaUsuario,
    eliminarTema,
    editarTema,
    votarTema,
    agregarEnlace,
    eliminarEnlace,
    editarEnlace,
    votarEnlace
};