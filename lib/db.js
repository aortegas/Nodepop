/*
 * Created by alberto on 10/10/15.
 */
'use strict';

var mongoose = require('mongoose');
var db = mongoose.connection;

// En caso de error de conexion, ejecutamos el evento...
db.on('error', function(err) {
    console.error('mongodb connection error:', err);
    process.exit(1);
});

// En caso de conexion correcta, ejecutamos el evento...
db.once('open', function() {
    console.info('Conectado a mongodb.');
});

mongoose.connect('mongodb://localhost/Nodepop');

// Cargamos las definiciones de todos nuestros modelos.
require('./../models/Anuncio');
require('./../models/Usuario');
require('./../models/PushToken');

module.exports = db;
