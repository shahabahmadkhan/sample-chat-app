'use strict';

const SERVER = {
    APP_NAME: 'Chat app',
    PORTS: {
        HAPI: 3000
    },
    JWT_SECRET_KEY: 'supersecretkeyToBeIn$ertedHere',
    PUBLIC_VAPID_KEY: 'BLh8Z0nwpZHpGtgT6LxcS3rV568doumSj0_2n78PQKjBCBQIjgjF3YkskL4Vi1WMEF9wkmfMIIMHGei3gHSGr94',
    PRIVATE_VAPID_KEY: 'ematnYA1WboLpMxqWD24n_KzD2__Tnm9m9ROVC2zcNI'

};

let swaggerDefaultResponseMessages = [
    {code: 200, message: 'OK'},
    {code: 400, message: 'Bad Request'},
    {code: 401, message: 'Unauthorized'},
    {code: 404, message: 'Data Not Found'},
    {code: 500, message: 'Internal Server Error'}
];

let STATUS_MSG = {
    ERROR: {
        INVALID_USER_PASS: {
            statusCode: 401,
            type: 'INVALID_USER_PASS',
            message: 'Invalid username or password'
        },
        IMP_ERROR: {
            statusCode: 500,
            message: 'Implementation Error',
            type: 'IMP_ERROR'
        },
        NOT_FOUND: {
            statusCode: 400,
            message: 'User Not Found',
            type: 'NOT_FOUND'
        },
        UNAUTHORIZED: {
            statusCode: 401,
            message: 'You are not authorized to perform this action',
            type: 'UNAUTHORIZED'
        },
        TOKEN_ALREADY_EXPIRED: {
            statusCode: 401,
            message: 'Token Already Expired',
            type: 'TOKEN_ALREADY_EXPIRED'
        },
        INVALID_TOKEN: {
            statusCode: 401,
            message: 'Invalid token provided',
            type: 'INVALID_TOKEN'
        }

    },
    SUCCESS: {
        CREATED: {
            statusCode: 201,
            message: 'Created Successfully',
            type: 'CREATED'
        },
        LOGIN: {
            statusCode: 200,
            message: 'Logged In Successfully',
            type: 'LOGIN'
        },
        DEFAULT: {
            statusCode: 200,
            message: 'Success',
            type: 'DEFAULT'
        },
        LOGOUT: {
            statusCode: 200,
            message: 'Logged Out Successfully',
            type: 'LOGOUT'
        }
    }
};

const APP_CONSTANTS = {
    SERVER,
    STATUS_MSG,
    swaggerDefaultResponseMessages
};

module.exports = APP_CONSTANTS;
