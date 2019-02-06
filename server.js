'use strict';

const Hapi = require('hapi');
const Inert = require('inert');
const Vision = require('vision');
const mongoose = require('mongoose');
const Ejs = require('ejs');
const Boom = require('boom');
const HapiSwagger = require('hapi-swagger');

const Routes = require('./Routes');
const Pack = require('./package');
const APP_CONSTANTS = require('./Config/appConstants');

process.env.NODE_ENV = process.env.NODE_ENV || 'dev'; // By default dev env variable

const MONGO_URI = require('./Config/dbConfig')[process.env.NODE_ENV + '_config'].mongo.URI;

//Define server constant
const server = new Hapi.Server({
    port: APP_CONSTANTS.SERVER.PORTS.HAPI,
    routes: {
        cors: true,
        validate: {
            failAction: async (request, h, err) => {
                if (process.env.NODE_ENV === 'prod') {
                    //TODO In prod, log a limited error message and throw the default Bad Request error.
                    console.error('ValidationError:', err.message);
                    throw Boom.badRequest(`Invalid request payload input`);
                } else {
                    // During development, log and respond with the full error.
                    console.error(err);
                    throw err;
                }
            }
        }
    }
});


const console_options = {
    ops: {
        interval: 1000
    }
};

//Initialise Server
(async () => {
    try {
        //Register Plugins
        const swaggerOptions = {
            info: {
                title: 'Chat App API',
                version: Pack.version,
            },
            host: APP_CONSTANTS.SERVER[process.env.NODE_ENV + '_HOST']
        };

        await server.register([
            Inert,
            Vision,
            {
                plugin: HapiSwagger,
                options: swaggerOptions
            },
            {
                plugin: require('good'),
                options: console_options,
            }
        ]);

        server.views({
            engines: {ejs: Ejs},
            relativeTo: __dirname,
            path: 'Public'
        });

        //Server all paths the public directory
        Routes.push({
            method: 'GET',
            path: '/{path*}',
            options: {
                auth: false
            },
            handler: {
                directory: {
                    path: './Public'
                }
            }
        });

        server.route(Routes);

        await server.start();

        // Once started, connect to Mongo through Mongoose
        mongoose.connect(MONGO_URI, {useNewUrlParser:true}).then(() => {
            console.log(`Connected to Mongo server`);
        }, err => {
            console.log(err)
        });

        console.log(`Server running at: ${server.info.uri}`, 'Environment:' + process.env.NODE_ENV);
    }
    catch (err) {
        console.log(err)
    }
})();
