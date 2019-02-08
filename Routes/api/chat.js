'use strict';

const Joi = require('joi');
const async = require('async');

const commonController = require('../../Controllers/commonController');

const chatController = require('../../Controllers/chatController');
const UniversalFunctions = require('../../Utils/UniversalFunctions');


const getRecentUserArray = (request, h) => {
    if (request.auth.isAuthenticated && request.auth.credentials.userData.id) {
        return new Promise(resolve => {
            commonController.getRecentChatArray(request.auth.credentials.userData.id, function (err, recentChatUserList) {
                resolve({statusCode: 200, status: 'success', recentChatArray: recentChatUserList || []})
            });
        })
    } else {
        return {message: 'Unauthorized', statusCode: 401, status: 'failure'}
    }
};

const getPaginatedChat = (request, h) => {
    if (request.auth.isAuthenticated && request.auth.credentials.userData.id) {
        return new Promise(resolve => {
            let payloadData = {
                current_user_id: request.auth.credentials.userData.id,
                other_user_id: request.payload.with_user_id

            };
            chatController.getPaginatedChats(payloadData, function (err, chatMsgArray) {
                if (err) {
                    resolve(err)
                } else {
                    if (chatMsgArray && chatMsgArray.length) {
                        chatMsgArray.forEach(function (chatMsgObj) { //inserting direction
                            chatMsgObj.direction = (chatMsgObj.from_user_id.toString() === request.payload.with_user_id.toString()) ? 'received' : 'sent';
                            delete chatMsgObj.from_user_id; //delete repeated data
                            delete chatMsgObj.to_user_id; // delete repeated data

                        })
                    }
                    resolve({statusCode: 200, status: 'success', chatMsgArray})
                }
            })
        })
    } else {
        return {message: 'Unauthorized', statusCode: 401, status: 'failure'}
    }
};

module.exports = [
    {
        method: 'GET', path: '/api/chat/getRecentUserArray',
        options: {
            handler: getRecentUserArray,
            auth: 'simple',
            validate: {
                headers: UniversalFunctions.authorizationHeaderObj
            },
            tags: ['chat', 'api'],
            description: 'Get Recent Chat Array'
        }
    },

    {
        method: 'POST', path: '/api/chat/getPaginatedChat', //using POST instead of get so as not to expose any critical data in the URI
        options: {
            handler: getPaginatedChat,
            auth: 'simple',
            validate: {
                headers: UniversalFunctions.authorizationHeaderObj,
                payload: {
                    with_user_id: Joi.string()
                        .required()
                        .description('Enter User Id Of Friend to Find Your Chats With Them')
                }
            },
            tags: ['chat', 'api'],
            description: 'Find Chats'
        }
    }
];
