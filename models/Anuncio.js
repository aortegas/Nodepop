/*
 * Created by alberto on 10/10/15.
 */
'use strict';

// Requerimos Mongoose.
var mongoose = require('mongoose');
// Requerimos el modulo con los parametros de configuracion de la Api.
var configApi = require('../moduleConfigApi').anuncios;

// Definimos un Schema para el anuncio, indicando en los campos sobre los que se van a existir filtros,
// la creacion de indices, para que las busquedas sean mas rapidas.
var anuncioSchema = mongoose.Schema({
    nombre: { type: String, index: true },
    venta:  { type: Boolean, index: true },
    precio: { type: Number, index: true },
    foto: String,
    tags:   { type: [String], index: true }
});

// Lista de Tags permitidos.
anuncioSchema.statics.allowedTags = function() {
    return ['work', 'lifestyle', 'motor', 'mobile'];
};

// Cargamos un metodo para el Schema para cargar un par de anuncios desde un .json
anuncioSchema.statics.cargaJson = function(fichero, cb) {
    var fs = require('fs');
    // requerimos un modulo que usaremos para tratar los anuncios que hemos cargado del archivo .json
    var flow = require('../lib/utilArray');

    fs.readFile(fichero, {encoding:'utf8'}, function(err, data) {
        if (err) {
            return cb(err);
        }

        if (data) {

            var anuncios = JSON.parse(data).anuncios;
            var numAnuncios = anuncios.length;

            // tratamos cada anuncio haciendo un Schema.save del mismo.
            flow.trataArray(anuncios, Anuncio.createRecord, function(err) {
                if (err) {
                    return cb(err);
                }

                // Devolvemos sin errores el numero de anuncios cargados.
                return cb(null, numAnuncios);
            });

        } else {
            return cb(new Error(fichero + ' está vacio!'));
        }
    });
};

// Cargamos un metodo para el Schema para cargar un par de anuncios desde un .json
anuncioSchema.statics.createRecord = function(nuevo, cb) {
    new Anuncio(nuevo).save(cb);
};

// Cargamos un metodo para el Schema para listar los anuncios en funcion de varios valores.
anuncioSchema.statics.list = function(startRow, numRows, sortField, includeTotal, filters, cb) {

    // Declaramos una variable en la vendra informado los campos query: tag, venta/compra, nombre y precio
    var query = Anuncio.find(filters);

    // Indicamos el campo de ordenacion.
    query.sort(sortField);

    // Indicamos las filas desde las que debe empezar a listar.
    query.skip(startRow);

    // Indicamos el numero de filas maximo a listar.
    query.limit(numRows);

    // Ejecutamos el query.
    return query.exec(function(err, rows) {
        if (err) {
            return cb(err);
        }

        // Si no hay errores, formateamos la url de la imagenes.
        rows.forEach( function(row) {
            if (row.foto) {
                row.foto = configApi.imagesURLBasePath + row.foto;
            }
        });

        // Formateamos el resultado.
        var result = {rows: rows};

        // Si no se queria el numero total de registros encontrados, devolvemos unicamente los resultados.
        if (!includeTotal) {
            return cb(null, result);
        }

        // Si se queria informar el numero total de registros encontrados, lo devolvemos + los resultados.
        // No le pasamos ningun parametro, para que cuente todos los registros de la base de datos.
        Anuncio.getCount({}, function(err, total) {
            if (err) {
                return cb(err);
            }

            result.total = total;
            return cb(null, result);
        });
    });
};

anuncioSchema.statics.getCount = function(filter, cb) {

    // Devolvemos el numero total de anuncios e indicamos a Count que llame al callback que nos pasan.
    return Anuncio.count(filter, cb);
};

var Anuncio = mongoose.model('Anuncio', anuncioSchema);

