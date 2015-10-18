'use strict';

// Cargamos el modulo de express.
var express = require('express');
var router = express.Router();
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {

    // Leemos el archivo README.md
    fs.readFile(__dirname + '/../README.md', {encoding: 'utf8'}, function (err, data) {
        if (err) {
            console.log(err);
            return next(new Error('Can not read README.md file'));
        }

        // Utilizamos la vista index para visualizar el archivo readme.md
        // Le mandaremos como informacion variable el titulo de la Api (title) y el archvo (readme).
        res.render('index', { title: 'Nodepop', readme: data });
    });
});

module.exports = router;
