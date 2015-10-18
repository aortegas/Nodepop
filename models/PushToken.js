/*
 * Created by alberto on 11/10/15.
 */

'use strict';

// Requerimos Mongoose.
var mongoose = require('mongoose');

// Trabajamos con el modelo de Usuario.
var Usuario = mongoose.model('Usuario');

// Definimos un Schema para el token, indicando en los campos sobre los que se van a existir filtros,
// la creacion de indices, para que las busquedas sean mas rapidas.
// Las plataformas a las que se dara servicio son iOS y Android.
var pushTokenSchema = mongoose.Schema({
    token:      {type: String, index: true },
    plataforma: {type: String, enum: ['ios', 'android'], index: true},
    usuario:    {type: String, index: true },
    createdAt:  Date // Este campo nos servira para conocer cual es el ultimo token de un usuario!
});

// Cargamos un metodo para el Schema para guardar un nuevo token.
pushTokenSchema.statics.createRecord = function(nuevopushtoken, cb) {

    console.log('token: ', nuevopushtoken.token);
    console.log('plataforma: ', nuevopushtoken.plataforma);
    console.log('idusuario: ', nuevopushtoken.usuario);




    // Declaramos un array para almacenar todos los errores que encontremos.
    var erroresValidacion = [];

    // Si no tenemos el token a guardar, incluimos el error de validacion.
    if (!nuevopushtoken.token) {
        erroresValidacion.push({field: 'token', message:'validation_invalid'});
    }

    // Si no tenemos la plataforma, o esta no es iOS o Android, incluimos el error de validacion.
    if (nuevopushtoken.plataforma) {

        // pasamos a minuscula la info de la plataforma que nos llega.
        nuevopushtoken.plataforma = nuevopushtoken.plataforma.toLowerCase();

        if (!(nuevopushtoken.plataforma === 'ios' || nuevopushtoken.plataforma === 'android')) {
            erroresValidacion.push({field: 'plataforma', message:'validation_invalid'});
        }

    } else {
        erroresValidacion.push({field: 'plataforma', message:'validation_invalid'});
    }

    // Si hemos detectado algun error, entonces retornamos un error 422 y devolvemos los errores.
    if (erroresValidacion.length > 0) {
        return cb({ code: 422, errors: erroresValidacion });
    }

    // Si no tenemos usuario informado, guardamos el token sin usuario, ya que este es opcional.
    if (!nuevopushtoken.usuario) {
        return guardarPushToken();
    }

    // Si tenemos el usuario informado, validamos que exista.
    Usuario.exists(nuevopushtoken.usuario, function(err, usuarioExiste) {
        // si no existe el usuario devolvemos error.
        if (!usuarioExiste) {
            return cb({code: 404, message: 'users_user_not_found'});
        }

        if (err) {
            return cb(err);
        }

        // Si el usuario existe, guardamos el token.
        return guardarPushToken();
    });

    // Funcion para guardar el token en la base de datos.
    function guardarPushToken() {

        // Obtenemos la fecha de creacion, para incluirla en el token.
        nuevopushtoken.createdAt = new Date();

        // Con save guardamos el token.
        new PushToken(nuevopushtoken).save(cb);
    }
};

var PushToken = mongoose.model('PushToken', pushTokenSchema);

