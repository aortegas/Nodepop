'use strict';

var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

/* jshint ignore:start */
// Aqui es donde ejecutamos el codigo de conexion con la base de datos.
// Hacemos que JSHint no lo verifique porque nos dara error por no utilizar la variable db.
var db = require('./lib/db');
/* jshint ignore:end */

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', routes);
app.use('/users', users);

// Registramos lenguajes que usaremos en la api.
var language = require('./lib/languages');
// Declaramos por orden, los idiomas que utilizaremos.
language.registerLanguage('en');
language.registerLanguage('es');

// Indicamos siempre el lenguaje en request leyendo cabecera x-lang
app.use(function(req, res, next) {
    req.idLanguage = req.get('x-lang');
    next();
});

// Definimos las rutas que usaremos en la api.
app.use('/pruebas/anuncioSave', require('./routes/pruebas/anuncioSave'));
app.use('/apiv1.0.0/anuncios', require('./routes/apiv1.0.0/anuncios'));
app.use('/apiv1.0.0/usuarios', require('./routes/apiv1.0.0/usuarios'));
app.use('/apiv1.0.0/pushtoken', require('./routes/apiv1.0.0/pushtoken'));

// Manejadores de errores.
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Manejador de errores en desarrollo.
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {

      res.status(err.status || 500);

      // Capturamos en el error si este vino de la api, devolvemos JSON.
      if (req.path.match(/apiv1.0.0/)) {

           return res.json({
                ok: false,
                error: {code: err.status || 500, message: err.message, err: err}
           });
      }

      res.render('error', {
            message: err.message,
            error: err
    });
  });
}

// Manejador de errores en produccion.
app.use(function(err, req, res, next) {
    res.status(err.status || 500);

    // Capturamos en el error si este vino de la api, devolvemos JSON.
    if (req.path.match(/apiv1.0.0/)) {

        return res.json({
            ok: false,
            error: {code: err.status || 500, message: err.message, err: err}
        });
    }

    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
