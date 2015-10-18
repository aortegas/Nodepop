/*
 * Created by alberto on 11/10/15.
 */
'use strict';

// Con la funcion extend podemos copiar las propiedades de un objeto a otro.
var _extend = require('util')._extend;

// Requerimos el modulo de lenguajes.
var language = require('./languages');

// Definimos la funcion para traducir mensajes.
function translateMessage(message, idlanguage) {

    // Si el mensaje que nos llega es un objeto, entonces tenemos la plantilla con error.
    if (typeof message === 'object') {
        return language.translate(message.template, idlanguage, message.values);
    } else {
        return language.translate(message, idlanguage);
    }
}

// Metodo para devolver los errores que nos llega en formato .json en el lenguaje deseado.
var errors = function(err, idlanguage) {

    // Declaramos una variable con status 500.
    var status = 500;

    // Declaramos otra variable con el objeto que se informara en formato .json con el error.
    // Este objeto contendra una variable ok (false/true) que false indicara error.
    // Y un objeto error a su vez, que contendra la informacion del mismo.
    var json = {ok: false, error:{}};

    // Si error que nos llega es de tipo Error de JS, lo convertimos
    if (err instanceof Error) {

        // Informamos el error en el objeto error.
        json.error.code = 500;
        json.error.message = err.message;

    } else {

        // Si el error que nos llega no es tipo Error de JS, extraemos status si lo tiene.
        if (err.status) {
            // Nos quedamos con el status y lo borramos.
            status = err.status;
            delete err.status;
        }

        // Añadimos el resto de las propiedades del objeto que nos llega al nuestro objeto error.
        _extend(json.error, err);

        // Una vez tenemos nuestro objeto json con la informacion del error, traducimos el mismo al lenguaje que nos piden.
        // Si tenemos dentro de el, el propiedad message. Estos seran los errores simple, no multiples como los de validacion de alta.
        if (json.error.message) {
            json.error.message = translateMessage(json.error.message, idlanguage);
        }

        // Al copiar las propiedades del error, si existe la propiedad errors, tratamos cada uno de ellos
        // para traducir tambien sus mensajes. Por ejemplo los de validacion al dar de alta al nuevo usuario.
        if (json.error.errors) {

            // Recorremos los errores.
            json.error.errors.forEach(function(error) {

                // Si tenemos la propiedad message dentro del error.
                if (error.message) {

                    // Si la propiedad message es un un objeto.
                    if (typeof error.message === 'object') {

                        // Indicamos una plantilla de error por defecto, si no la tiene.
                        error.message.values.field = error.field || language.translate('the_field', idlanguage);
                        error.message = translateMessage({
                            template: error.message.template,
                              values: error.message.values
                            }, idlanguage);

                    } else {

                        error.message = translateMessage({
                        template: error.message,
                        values: {field: error.field || language.translate('the_field')}
                        }, idlanguage);
                    }
                }
            });
        }
    }

    // Estas lineas siguientes, sirven para declarar la funcion: json, a la cual nos llamaran de la forma:
    //  return errors({code: 401, message: 'users_user_not_found' }, req.idLanguage).json(res):
    // Es decir, devolvemos un objeto con un metodo 'json' que sera invocado con la salida de errors,
    // Cuando llega aqui, res tiene la salida de error y formateamos a json con la instruccion:
    // return res.status(status).json(json);
    return {
        json: function (res) {
            if (res) {
                return res.status(status).json(json);
            }
            return json;
        }
    };
};

module.exports = errors;

