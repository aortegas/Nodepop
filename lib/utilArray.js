/*
 * Created by alberto on 10/10/15.
 */
'use strict';

// Funcion recursiva para tratar un array de anuncios.
var trataArray = function(arr, func, callbackFin) {

    // Si tenemos anuncios en el array.
    if (arr.length > 0) {

        // Llamo a la func que me pasan como parametro (func) y me llamo a mi misma.
        func(arr.shift(), function(err) {
            if (err) {
                return callbackFin(err);
            }

            trataArray(arr, func, callbackFin);
        });

    } else {
        // He acabado y llamo al callback que me indicaron.
        callbackFin();
    }
};

module.exports = {
    trataArray: trataArray
};
