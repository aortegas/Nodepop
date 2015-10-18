/*
 * Created by alberto on 11/10/15.
 */
'use strict';

var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var Usuario = mongoose.model('Usuario');

var jwt = require('jsonwebtoken');
var config = require('../../moduleConfigApi');
var errors = require('../../lib/errores');
var language = require('../../lib/languages');
var hash = require('sha.js');

// Tratamos la ruta '/authenticate para la autentificacion de usuarios.
router.post('/authenticate', function(req, res) {

    // Nos quedamos con el email y la clave a autentificar.
    var email = req.body.email;
    var clave = req.body.clave;

    // Buscamos el usuario por email.
    Usuario.findOne({email: email}, function(err, usuario) {

        // Si hubo error, ejecutamos la funcion errors del modulo errores para devolver el error en el lenguaje del usuario.
        // Lo devolvemos en formato .json.
        if (err) {
            return errors(err, req.idLanguage).json(res);
        }

        // Si el usuario no existe, informamos un error.
        if (!usuario) {
            return errors({code: 401, message: 'users_user_not_found' }, req.idLanguage).json(res);

        } else if (usuario) {

            // Si el usuario existe, hasteamos su clave para comparar si la password es correcta.
            var sha256 = hash('sha256');
            var claveHash = sha256.update(clave, 'utf8').digest('hex');
            clave = claveHash;

            // la contraseña es la misma?
            if (usuario.clave != clave) {

                // Si la password no es correcta, devolvemos error.
                return errors({code: 401, message: 'users_wrong_password' }, req.idLanguage).json(res);

            } else {

                // Si usuario y password son correctos, le hacemos un token.
                var token = jwt.sign({user: usuario}, config.jwt.secret, {
                    expiresIn: config.jwt.expiresIn
                });

                // Devolvemos la informacion, con el token y el JSON
                return res.json({
                    ok: true,
                    token: token
                });
            }
        }
    });
});


// Tratamos la ruta '/register para el registro de usuarios.
router.post('/register', function(req, res) {

    // Nos creamos un nuevo objeto Usuario, con la informacion que nos llega.
    var nuevoUsuario = {
        nombre: req.body.nombre,
        email: req.body.email,
        clave: req.body.clave
    };

    // Creamos el usuario.
    Usuario.createRecord(nuevoUsuario, function(err) {

        // Si nos falla la creacion, devolvemos el error.
        if (err) {
            return errors(err, req.idLanguage).json(res);
        }

        // Devolvemos el mensaje de usuario creado.
        return res.json({
            ok: true,
            message: language.translate('users_user_created')
        });

    });

});

module.exports = router;
