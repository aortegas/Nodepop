/**
 * Created by alberto on 13/10/15.
 */
'use strict';

var jwt = require('jsonwebtoken');
var configJWT = require('./../moduleConfigApi').jwt;

// Funcion para autentificar usuarios mediante un token JWT.
module.exports = function() {

    return function(req, res, next) {

        // Verificamos que el token venga informado en la cabecera o el body de la solicitud.
        var token = req.body.token || req.query.token || req.headers['x-access-token'];

        console.log('punto1' + token);

        // Si tenemos token, lo decodificamos en base a nuestra clave.
        if (token) {

            jwt.verify(token, configJWT.secret, function(err, decoded) {
                if (err) {
                    // Si fallo, el decodifcado del token.
                    return res.json({ ok: false, error: {code: 401, message: 'Failed to authenticate token.'}});
                } else {
                    // Si todo ha ido bien, guardamos en el objeto req el token, para que valga en las solicitudes.
                    req.decoded = decoded;
                    next();
                }
            });

        } else {

            // Si no hay token, devolvermos error.
            return res.status(403).json({
                ok: false,
                error: { code: 403, message: 'No token provided.'}
            });

        }
    };
};
