/*
 * Created by alberto on 10/10/15.
 */
'use strict';

var mongoose = require('mongoose');
var readLine = require('readline');
var async = require('async');
// Requerimos los modelos que tenemos en el Api.
var db = require('./lib/db');

db.once('open', function() {

    // Nos preparamos para leer una entrada desde consola con informacion del usuario con readLine.
    var rl = readLine.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    // Preguntamos al usuario si realmente quiere borrar las bases de datos.
    rl.question('Are you sure you want to empty DB? (no) ', function(answer) {
        rl.close();
        if (answer.toLowerCase() === 'yes') {
            runInstallScript();
        } else {
            console.log('DB install aborted!');
            return process.exit(0);
        }
    });
});

function runInstallScript() {
    // Mediante async.series ejecutamos una serie de funciones de forma asincrona y nos paramos si alguna de ellas retorna un error.
    // Ejecutamos la inicializacion de Anuncios, Usuarios y Tokens.
    async.series([initAnuncios, initUsuarios, initPushTokens], function(err) {
        if (err) {
            console.error('Hubo un error: ', err);
            return process.exit(1);
        }
        return process.exit(0);
    });
}

function initAnuncios(cb) {

    // Utilizamos el modelo de Anuncio.
    var Anuncio = mongoose.model('Anuncio');

    // Borramos la base de datos de Anuncios.
    Anuncio.remove({}, function() {
        console.log('Anuncios borrados.');

        // Cargar anuncios.json para tener en la base de datos, al menos dos anuncios.
        var fichero = './anunciosPorDefecto.json';
        console.log('Cargando ' + fichero + '...');

        Anuncio.cargaJson(fichero, function(err, numLoaded) {
            if (err) {
                return cb(err);
            }

            console.log('Se han cargado: ' + numLoaded +  ' anuncios.');

            // Devolvemos con cb, sin errores el numero de anuncios creados.
            return cb(null, numLoaded);
        });
    });
}

function initUsuarios(cb) {

    // Utilizamos el modelo de Usuario.
    var Usuario = mongoose.model('Usuario');

    // Borramos la base de datos de Usuarios.
    Usuario.remove({}, function () {
        console.log('Usuarios borrados.');

        // Cargamos al menos al usuario administrador, mediante un array de objetos Usuarios.
        var usuarios = [
            {nombre: 'admin', email: 'aortegas4@gmail.com', clave: '123456'}
        ];

        // Recorremos de forma asincrona el array de usuarios y vamos creando cada uno.
        async.eachSeries(usuarios, Usuario.createRecord, function (err) {
            if (err) {
                return cb(err);
            }

            console.log('Se han cargado ' + usuarios.length +' usuarios.');

            // Devolvemos con cb, sin errores el numero de usuarios creados.
            return cb(null, usuarios.length);
        });
    });
}

function initPushTokens() {

    // Utilizamos el modelo de Token.
    var PushToken = mongoose.model('PushToken');

    // Borramos la base de datos de Tokens.
    PushToken.remove({}, function () {
        console.log('PushTokens borrados.');
    });
}