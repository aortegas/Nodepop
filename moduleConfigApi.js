/*
 * Created by alberto on 11/10/15.
 */
module.exports = {
    jwt: {
        // Creamos una cadena inventada para codificar los tokens.
        // Incluimos este fichero en .gitignore para no subir al repo la misma.
        secret: 'cadenaparacodificartokensdeprueba',
        // El token expira en 15minutos.
        expiresIn: 900
    },
    anuncios: {
        imagesURLBasePath: '/images/anuncios/'
    }
};
