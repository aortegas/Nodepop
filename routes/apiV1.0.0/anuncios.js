/*
 * Created by alberto on 11/10/15.
 */
'use strict';

var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var Anuncio = mongoose.model('Anuncio');

// Autentificacion con JWT.
// Lo que hacemos es cargar el modulo de verificacion del token, para que verifique
// que el token que nos pasan es correcto. Lo hacemos con las siguientes dos instrucciones:
var jwtAuth = require('../../lib/jwtAuthenticate');
router.use(jwtAuth());

// Tratamos la ruta '/'
router.get('/', function(req, res) {

    var filters = {};

    // Obtenemos los valores del query string que nos llega en la peticion.
    // Comenzamos por el tag.
    if (typeof req.query.tag !== 'undefined') {
        filters.tags = req.query.tag;
    }

    // Venta o Compra.
    if (typeof req.query.venta !== 'undefined') {
        filters.venta = req.query.venta;
    }

    // Nombre del articulo.
    if (typeof req.query.nombre !== 'undefined') {
        // Creamos una expresion con RegExp para encontrar un texto de acuerdo a un patron.
        // El caracter '^' especifica encuentre el nombre que se busca al principio.
        // Si quisieramos un like, no indicamos caracter flag en RegExp:
        // filters.nombre = new RegExp(req.query.nombre, 'i');
        // El flag 'i' indica que ignore mayusculas y minusculas.
        filters.nombre = new RegExp('^' + req.query.nombre, 'i');
    }

    // Rangos de precios.
    if (typeof req.query.precio !== 'undefined' && req.query.precio !== '-') {

        // Comprobamos si nos piden precios inferiores o superiores a..., o sea con rango.
        if (req.query.precio.indexOf('-') !== -1) {
            filters.precio = {};

            //Obtenemos en un array los rangos, separados por '-'.
            var rango = req.query.precio.split('-');

            // Si tenemos rango inferior, lo indicamos lo formateamos para la consulta.
            if (rango[0] !== '') {
                filters.precio.$gte = rango[0];
            }

            // Si tenemos rango superior, lo indicamos lo formateamos para la consulta.
            if (rango[1] !== '') {
                filters.precio.$lte = rango[1];
            }

        // Si no tenemos rango, entonces la consulta es un precio exacto.
        } else {
            filters.precio = req.query.precio;
        }
    }

    // Indicamos el numero del registro por el que comenzamos y el limite para la paginacion.
    var start = parseInt(req.query.start) || 0;
    var limit = parseInt(req.query.limit) || 1000; // por defecto 1000 el api devolvera 1000 registros max. en cada llamada.

    // Indicamos que por defecto el campo de ordenacion sea id, que pone Mongo por defecto.
    var sort = req.query.sort || '_id';

    // Indicamos el flag de que visualizacion del total de registros, si asi nos lo solicitan.
    var includeTotal = req.query.includeTotal === 'true';

    // Invocamos al modelo todas las variables que hemos ido informando.
    Anuncio.list(start, limit, sort, includeTotal, filters, function(err, result) {
        if (err) {
            return res.status(500).json({ok: false, error: {code: 500, message: err.message}});
        }

        res.json({ok: true, result: result});
    });
});

// Tratamos la ruta '/tags' que servira para listar todos los tags permitidos.
router.get('/tags', function(req, res) {
    res.json({ok: true, allowedTags: Anuncio.allowedTags()});
});

module.exports = router;
