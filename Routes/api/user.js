'use strict';

const Joi = require('joi');
const async = require('async');

const userController = require('../../Controllers/userController');
const TokenManager = require('../../Utils/TokenManager');
const UniversalFunctions = require('../../Utils/UniversalFunctions');
const APP_CONSTANTS = require('../../Config/appConstants');

const webpush = require('web-push');

const publicVapidKey = APP_CONSTANTS.SERVER.PUBLIC_VAPID_KEY;
const privateVapidKey = APP_CONSTANTS.SERVER.PRIVATE_VAPID_KEY;

// Replace with your email
webpush.setVapidDetails('mailto:me@shahab.in', publicVapidKey, privateVapidKey);

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

const notificationHandler = (request, h) => {
    return new Promise(resolve => {
            const subscription = dummyDb.subscription //get subscription from your databse here.
        const message = 'You got a new message'
        webpush.sendNotification(subscription, message)
        resolve({statusCode: 200, message: 'success'})
    })
};

let subscriberHandler = (request) => {
    return new Promise(resolve => {
        if (request.auth.isAuthenticated && request.auth.credentials.userData.id) {
            let subscription = JSON.parse(request.payload.subscription);
            const payload = JSON.stringify({ title: 'Sample Chat App', msgFromServer : 'You are now subscribed to notification' });
            console.log(subscription);

            userController.updateSubscription(request.auth.credentials.userData.id, request.payload.subscription, function (err, status) {
                //status == 1 (already existed), status == 0 not existed
                if (err){
                    console.log('err',err);
                }else {
                    if (status === 0){
                        webpush.sendNotification(subscription, payload).catch(error => {
                            console.error(error.stack);
                        });
                    }
                }
            });



            resolve({statusCode: 200, status: 'success'})
        }else {
            return {message: 'Unauthorized', statusCode: 401, status: 'failure'}
        }


    })
};

module.exports = [
    {
        method: 'POST', path: '/api/user/subscribe', //using POST instead of get so as not to expose any critical data in the URI
        options: {
            handler: subscriberHandler,
            auth: 'simple',
            validate: {
                headers: UniversalFunctions.authorizationHeaderObj,
                payload: {
                    subscription: Joi.string()
                        .required()
                        .description('subscription json string')
                }
            },
            tags: ['chat', 'api'],
            description: 'Find Chats'
        }
    },
    {
        method: 'GET', path: '/api/user/sendNotification',
        options: {
            handler: notificationHandler,
            tags: ['user','api'],
            description: 'WEb Push API'
        }
    },
    {
        method: ['POST'], path: '/api/user/login',
        options: {
            handler: postLogin,
            description: 'Login API',
            tags: ['user','api'],
            validate: {
                payload: {
                    username: Joi.string()
                        .required().min(3)
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
