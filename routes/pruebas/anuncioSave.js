/*
 * Created by alberto on 10/10/15.
 */
'use strict';

var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var Anuncio = mongoose.model('Anuncio');

/* GET home page from  agents. */
router.get('/', function(req, res, next) {

    // Crear un registro de anuncio.
    var anuncio = new Anuncio({nombre:'Cuerda Escalada', venta:true, precio:50, foto:'cuerda.jpg', tags:['lifestyle']});

    anuncio.save(function (err, creado) {
        if(err){
            console.log(err);
            return next(err);
        }
        console.log(creado);
    });

    res.send('prueba de alta de anuncio, realizada correctamente.');
});

module.exports = router;



