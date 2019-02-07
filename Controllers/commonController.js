'use strict';
//Services or data which is required by more than one controllers
const async = require('async');
const chatService = require('../Services').Chats;

const getRecentChatArray = (currentUserId, cb) => {
    let distinctUserIds = [];
    async.auto({
        'checkForSender': function (internalCB) {
            let criteria = {
                from_user_id: currentUserId
            };
            chatService.getDistinctValues('to_user_id', criteria, function (err, result) {
                if (result && result.length) {
                    result.forEach(function (userId) {
                        userId = userId.toString();
                        if (distinctUserIds.indexOf(userId) === -1) {
                            distinctUserIds.push(userId)
                        }
                    })
                }
                internalCB()
            })
        },
        'checkForReceiver': function (internalCB) {
            let criteria = {
                to_user_id: currentUserId
            };
            chatService.getDistinctValues('from_user_id', criteria, function (err, result) {
                if (result && result.length) {
                    result.forEach(function (userId) {
                        userId = userId.toString();
                        if (distinctUserIds.indexOf(userId) === -1) {
                            distinctUserIds.push(userId)
                        }
                    })
                }
                internalCB()
            })
        }
    }, function (err) {
        cb(err, distinctUserIds);
    })
};

module.exports = {
    getRecentChatArray
};


