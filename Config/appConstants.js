'use strict';

const SERVER = {
    APP_NAME: 'Chat app',
    PORTS: {
        HAPI: 3000
    },
    dev_HOST: 'localhost:3000',
    dev_DOMAIN: 'localhost:3000'
};

let swaggerDefaultResponseMessages = [
    {code: 200, message: 'OK'},
    {code: 400, message: 'Bad Request'},
    {code: 401, message: 'Unauthorized'},
    {code: 404, message: 'Data Not Found'},
    {code: 500, message: 'Internal Server Error'}
];


const APP_CONSTANTS = {
    SERVER,
    swaggerDefaultResponseMessages
};

module.exports = APP_CONSTANTS;
