/*
 * Created by alberto on 11/10/15.
 */

'use strict';

var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var PushToken = mongoose.model('PushToken');
var errors = require('../../lib/errores');

router.post('/', function(req, res) {

    // Declaramos un objeto con la informacion del pushToken que nos llega.
    var nuevoPushToken = {
        token: req.body.pushtoken,
        plataforma: req.body.plataforma,
        usuario: req.body.idusuario || undefined
    };

    PushToken.createRecord(nuevoPushToken, function (err, creado) {

        // Si nos falla la creacion, devolvemos el error.
        if (err) {
            return errors(err, req.idLanguage).json(res);
        }

        // Devolvemos el mensaje de pushToken creado.
        return res.json({
            ok: true,
            created: creado
        });
    });
});

module.exports = router;
