'use strict';

const Joi = require('joi');
const async = require('async');

const userController = require('../../Controllers/userController');
const TokenManager = require('../../Utils/TokenManager');
const UniversalFunctions = require('../../Utils/UniversalFunctions');

const postLogin = async (request, h) => {
    if (!request.payload.username || !request.payload.password) {
        return {message: 'Missing username or password', statusCode: 401, status: 'failure'}
    }
    else {
        return new Promise(resolve => {
            let payloadData = request.payload;
            userController.loginUser(payloadData, function (err, dataToSend) {
                if (err) {
                    if (typeof  err == 'string'){
                        resolve({message: err, statusCode: 401, status: 'failure'})

                    }else {
                        resolve(err)
                    }

                } else {
                    resolve({
                        message: 'Login Successful',
                        statusCode: 200,
                        status: 'success',
                        userData: dataToSend
                    })
                }
            })
        })
    }
};

const logoutHandler = (request, h) => {
    return new Promise(resolve => {
        TokenManager.expireToken(request.auth.credentials.token, (err, dataToSend) => {
            if (err) {
                resolve(err)
            } else {
                resolve({statusCode: 200, message: 'success'})
            }
        })
    })
};

const verifySession = (request, h) => {
    return new Promise(resolve => {
        TokenManager.verifyToken(request.auth.credentials.token, (err, dataToSend) => {
            if (err) {
                resolve(err)
            } else {
                resolve({statusCode: 200, message: 'success'})
            }
        })
    })

}


const getUserInfo = (request, h) => {
    if (request.auth.isAuthenticated && request.auth.credentials.userData.id) {
        return new Promise(resolve => {
            userController.getUserViaId(request.auth.credentials.userData.id, function (err, dataToSend) {
                if (err) {
                    resolve(err)
                } else {
                    resolve({statusCode: 200, status: 'success', userInfo: dataToSend})
                }
            })
        })
    } else {
        return {message: 'Unauthorized', statusCode: 401, status: 'failure'}
    }
}

module.exports = [
    {
        method: ['POST'], path: '/api/user/login',
        options: {
            handler: postLogin,
            description: 'Login API',
            tags: ['user','api'],
            validate: {
                payload: {
                    username: Joi.string()
                        .required().min(5)
                        .description('Username'),
                    password: Joi.string().required().min(6).description('password')
                }
            }
        }
    },
    {
        method: 'GET', path: '/api/user/logout',
        options: {
            handler: logoutHandler,
            auth: 'simple',
            tags: ['user','api'],
            description: 'Logout API',
            validate: {
                headers: UniversalFunctions.authorizationHeaderObj
            }
        }
    },
    {
        method: 'GET', path: '/api/user/getUserInfo',
        options: {
            handler: getUserInfo,
            auth: 'simple',
            validate: {
                headers: UniversalFunctions.authorizationHeaderObj
            },
            tags: ['user','api'],
            description: 'Get User Info'
        }
    },

    {
        method: 'GET', path: '/api/verifySession',
        options: {
            handler: verifySession,
            auth: 'simple',
            validate: {
                headers: UniversalFunctions.authorizationHeaderObj
            },
            tags: ['user','api'],
            description: 'Verify User Session API'
        }
    }
];
