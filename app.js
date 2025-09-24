// se encarga de conectar las rutas con el controlador y de iniciar el servidor

// importar express
const express = require('express');

// importar el controlador
const temasController = require('./controller/temasController')

// importa el modulo path
const path = require('path');

// importar database.js
//const db = require('./database');

// ejecuta la funcion de creacion de tablas
const temasModel = require('./models/tablas');

// crear la tabla antes de iniciar el servidor
temasModel.crearTabla();

// inicializa Express
const app = express();
const port = 3000;

// Configurar EJS como el motor de plantillas
app.set('view engine', 'ejs'); // le dice a Express que use EJS como motor de plantillas
app.set('views', path.join(__dirname, 'views')); // le dice a Express donde encontrar los archivos de plantillas

// configurar de Express para manejar diferentes tipos de datos en las peticiones
app.use(express.json()) // para procesar JSON en las peticiones con req.body
app.use(express.urlencoded({ extended: true }));  // para procesar formularios HTML


// Definir las rutas y asociarlas con las funciones del controlador
app.get('/', temasController.renderizarIndex);
app.post('/temas', temasController.crearTemaUsuario);
app.delete('/temas/:id', temasController.eliminarTema);
app.put('/temas/:id', temasController.editarTema);
app.put('/temas/:id/votos', temasController.votarTema);
app.post('/temas/:id/enlaces', temasController.agregarEnlace);
app.delete('/temas/:temaId/enlaces/:enlaceId', temasController.eliminarEnlace);
app.put('/temas/:temaId/enlaces/:enlaceId', temasController.editarEnlace);
app.put('/temas/:temaId/enlaces/:enlaceId/votos', temasController.votarEnlace);

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});