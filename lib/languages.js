/*
 * Created by alberto on 11/10/15.
 */
'use strict';

// Declaramos un objeto vacio, en el que incluiremos la info de los lenguajes.
var language = {};

// Declaramos un array como propiedad del objeto language.
// Este array contendra la clave del lenguaje, asi como las plantillas y sus traducciones.
language.templates = [];

// Declaramos un metodo para el objeto language, para guardar la informacion de todos los mensajes que se requieran,
// que utilizaremos mas tarde, en los metodos siguientes.
language.registerLanguage = function(idLanguage) {

    // Declaramos una variable para quedarnos con el nombre del archivo que tiene la info del idioma.
    var stringsLanguage = require('../languages/' + idLanguage);

    // Completamos la info del objeto languaje.
    language.templates.push({
        idLanguage: idLanguage,
        stringsLanguage: stringsLanguage
    });
};

// Declaramos un metodo para el objeto language, para obtener el array de plantillas traducidas de ese lenguaje.
language.getTemplate = function(idLanguage) {
    for (var i = 0; i < language.templates.length; i++) {
        
        // Buscamos las plantillas con los mensajes de error traducidos del idioma que nos piden.
        var template = language.templates[i];

        if (template.idLanguage === idLanguage) {
            return template;
        }
    }
    
    // Si no hemos encontrado las plantillas del idioma deseado, devolvemos las del primer idioma que se cargo.
    return language.templates[0];
};

// Declaramos un metodo para el objeto language, para traducir una clave de plantilla que nos informen, en un idioma.
language.translate = function(key, idlanguage, values) {

    // Nos guardamos la clave de la plantilla del error.
    var plantillaError = key;

    // Nos guardamos las plantillas con las traducciones del idioma que nos dicen.
    var stringsLanguage = language.getTemplate(idlanguage).stringsLanguage;

    // Buscamos ahora la plantilla especifica que nos piden dentro de todas ellas.
    if (stringsLanguage.hasOwnProperty(key)) {
        // Si la tenemos nos guardamos su info (clave + valor).
         plantillaError = stringsLanguage[key];
    }

    // Si tiene valores (values que nos llegan) los reemplazamos.
    if (values) {

        // Con getOwnPropertyNames, obtenemos todas propiedades de un objeto dado, en este caso: values.
        // Y por cada una la reemplazamos.
        Object.getOwnPropertyNames(values).forEach( function(value) {
            plantillaError = plantillaError.replace('$$' + value + '$$', values[value]);
        });
    }

    return plantillaError;
};

module.exports = language;
