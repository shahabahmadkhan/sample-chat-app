'use strict';
//Services or data which is required by more than one controllers
const async = require('async');
const chatService = require('../Services').Chats;
const userService = require('../Services').Users;

const getRecentChatArray = (currentUserId, cb) => {
    let distinctUserIds = [];
    let distinctUserNames = [];
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
        },
        'fetchUserNames' : ['checkForSender', 'checkForReceiver', function (res, internalCB) {
            let criteria = {
                _id : {$in : distinctUserIds}
            };
            let projection = {username:1};
            userService.getUser(criteria,projection,{lean:true}, function (err, result) {
                if (!err && result){
                    result.forEach(function (userObj) {
                        distinctUserNames.push(userObj.username)
                    })
                }
                internalCB();
            })
        }]
    }, function (err) {
        cb(err, distinctUserNames);
    })
};

module.exports = {
    getRecentChatArray
};


