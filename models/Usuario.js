/*
 * Created by alberto on 11/10/15.
 */

'use strict';

// Requerimos Mongoose.
var mongoose = require('mongoose');

// Requerimos el modulo Hash que utilizaremos para reforzar la validacion de contraseñas.
var hash = require('sha.js');

// Definimos un Schema para el anuncio, indicando en los campos sobre los que se van a existir filtros,
// la creacion de indices, para que las busquedas sean mas rapidas.
var usuarioSchema = mongoose.Schema({
    nombre: { type: String, index: true },
    email:  { type: String, index: true },
    clave:  String
});

// Cargamos un metodo para el Schema para buscar un usuario.
usuarioSchema.statics.exists = function(idUsuario, cb) {

    Usuario.findById(idUsuario, function(err, findUser) {
        if (err) {
            return cb(err);
        }

        // Si el usuario buscado no existe, devolvemos false.
        if (!findUser) {
            return cb(null, false);
        }

        // Si el usuario existe, devolvemos true.
        return cb(null, true);
    });
};

// Cargamos un metodo para el Schema para crear un nuevo usuario.
usuarioSchema.statics.createRecord = function(nuevoUsuario, cb) {

    // Declaramos un array para almacenar todos los errores que encontremos.
    var erroresValidacion = [];

    // Trabajamos con el modulo validador, que utilizamos para validar cadenas.
    var validator = require('validator');

    // Validamos que el nombre de usuario sea alfabetico y que tenga al menos dos caracteres.
    // En otro caso, nos guardamos el error de validacion.
    if (!(validator.isAlpha(nuevoUsuario.nombre) && validator.isLength(nuevoUsuario.nombre, 2))) {
        erroresValidacion.push({field: 'nombre', message:'validation_invalid'});
    }

    // Validamos que el email, sea un email.
    // En otro caso, nos guardamos el error de validacion.
    if (!validator.isEmail(nuevoUsuario.email)) {
        erroresValidacion.push({field: 'email', message:'validation_invalid'});
    }

    // Validamos que la clave tenga al menos seis caracteres.
    // En otro caso, nos guardamos el error de validacion.
    if (!validator.isLength(nuevoUsuario.clave, 6)) {
        erroresValidacion.push({field: 'clave', message:{template:'validation_minchars', values: {num:'6'}}});
    }

    // Si hemos detectado algun error, entonces retornamos un error 422 y devolvemos los errores.
    if (erroresValidacion.length > 0) {
        return cb({ code: 422, errors: erroresValidacion });
    }

    // Si los datos de entrada del nuevo usuario son correctos, validamos ahora que no existiera previamente.
    Usuario.findOne({email: nuevoUsuario.email}, function(err, newUser) {
        if (err) {
            return cb(err);
        }

        // Si el usuario ya existia, entonces devolvemos un codigo de error 409.
        if (newUser) {
            return cb({code: 409, message: 'user_email_duplicated'});
        } else {

            // Si el usuario no existe, obtenemos un codigo hash de la contraseña que nos informaron.
            // Su contraseña sera el codigo hash generado, que es mejor guardar asi, en vez del texto plano de la clave.
            var sha256 = hash('sha256');
            var hashClave = sha256.update(nuevoUsuario.clave, 'utf8').digest('hex');
            nuevoUsuario.clave = hashClave;

            // creo el usuario
            new Usuario(nuevoUsuario).save(cb);
        }
    });
};

var Usuario = mongoose.model('Usuario', usuarioSchema);
