'use strict';
const async = require('async');
const bcrypt = require('bcrypt');
const userService = require('../Services').Users;
const commonController = require('./commonController');

const TokenManager = require('../Utils/TokenManager');

const APP_CONSTANTS = require('../Config/appConstants');

const webpush = require('web-push');

const publicVapidKey = APP_CONSTANTS.SERVER.PUBLIC_VAPID_KEY;
const privateVapidKey = APP_CONSTANTS.SERVER.PRIVATE_VAPID_KEY;

// Replace with your email
webpush.setVapidDetails('mailto:me@shahab.in', publicVapidKey, privateVapidKey);

const findUserByUsername = (username, cb) => {
    let userFound = false;

    let criteria = {
        username: username
    };

    let projection = {};
    let option = {
        lean: true
    };
    userService.getUser(criteria, projection, option, function (err, result) {
        if (err) {
            cb(APP_CONSTANTS.STATUS_MSG.ERROR.NOT_FOUND)
        } else {
            userFound = result && result[0] || null;
            cb(null, userFound);
        }
    });
};

//User Functions
const loginUser = (data, callback) => {
    let userFound = false;
    let accessToken = null;
    let successLogin = false;
    let updatedUserDetails = {
        availableUsers: []
    };

    async.series([
        function (cb) {
            findUserByUsername(data.username, function (err, userData) {
                if (err) {
                    cb(err)
                } else {
                    if (userData) {
                        userFound = userData;
                    }
                    cb();
                }
            })

        },
        function (cb) {
            //check password
            if (userFound) {

                bcrypt.compare(data.password, userFound.password, (err, isValid) => {
                    if (isValid) {
                        //proceed further
                        successLogin = true;
                        let tokenData = {
                            id: userFound._id,
                            username: userFound.username
                        };
                        TokenManager.setToken(tokenData, function (err, output) {
                            if (err) {
                                cb(err);
                            } else {
                                accessToken = output && output.accessToken || null;
                                updatedUserDetails = {
                                    user_id: userFound._id,
                                    username: userFound.username,
                                    userFullName: userFound.userFullName,
                                    userImage: userFound.userImage
                                };
                                cb();
                            }
                        })
                    }
                    else {
                        cb(APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_USER_PASS)
                    }
                });
            } else {
                cb(APP_CONSTANTS.STATUS_MSG.ERROR.NOT_FOUND)
            }
        },
        function (cb) {
            //get Distinct Users for recent chat list;
            commonController.getRecentChatArray(userFound._id, function (err, recentChatUserList) {
                updatedUserDetails.recentChatUserList = recentChatUserList || [];
                cb()
            })
        },
        function (cb) {
            let criteria = {
                _id: {$ne: userFound._id} // all other ids except yours
            };
            let projection = {
                userFullName: 1,
                username: 1,
                userImage: 1
            };
            userService.getUser(criteria, projection, {lean: true}, function (err, results) {
                if (err) {
                    cb(err)
                } else {
                    if (results && results.length) {
                        let availableUsersObj = {};
                        results.forEach(function (userData) {
                            userData.chatArray = [];
                            userData.activeSession = false;
                            availableUsersObj[userData.username] = userData;
                        });
                        updatedUserDetails.availableUsers = availableUsersObj;
                    }
                    cb();
                }
            })
        }
    ], function (err, data) {
        if (err) {
            return callback(err);
        } else {
            return callback(null, {accessToken: accessToken, userDetails: updatedUserDetails});
        }
    });
};

function getUserViaId(userId, cb) {
    let criteria = {
        _id: userId
    };
    let projection = {_id: 1, userFullName: 1, username: 1};
    let option = {
        lean: true
    };
    userService.getUser(criteria, projection, option, function (err, result) {
        if (err) {
            cb(APP_CONSTANTS.STATUS_MSG.ERROR.NOT_FOUND)
        } else {
            if (result && result[0]) {
                cb(null, result && result[0]);
            } else {
                cb(APP_CONSTANTS.STATUS_MSG.ERROR.NOT_FOUND)
            }
        }
    });
}

const updateSubscription = (userId, subscriptionData, callback) => {
    let status = 0;
    async.auto({
        'checkIfAlreadyExisted': function (cb) {
            let criteria = {
                _id: userId
            };
            let projection = {subscriptionData: 1};
            userService.getUser(criteria, projection, {lean: true}, function (err, result) {
                if (err) {
                    cb(err)
                } else {
                    if (result && result[0] && result[0].subscriptionData && result[0].subscriptionData.length) {
                        status = 1;
                    }
                    cb();
                }
            })
        },
        'updateSubscriptionData': ['checkIfAlreadyExisted', function (res, cb) {
            let criteria = {
                _id: userId
            };
            let dataToUpdate = {
                subscriptionData
            };
            userService.updateUser(criteria, dataToUpdate, {new: true}, cb)
        }]
    }, function(err) {
        if (err) {
            callback(err)
        } else {
            callback(null, status)
        }
    })

};

process.on('sendWebPush', function (dataToSave) {
    let criteria = {
        _id: dataToSave.to_user_id
    };
    let projection = {subscriptionData:1};
    userService.getUser(criteria,projection,{lean:true}, function (err, result) {
        if (err){
            console.log('err',err)
        }else {
            let subscriptionData = result && result[0] && result[0].subscriptionData || null;
            if (subscriptionData && subscriptionData.length){
                let subscription = JSON.parse(subscriptionData);
                const payload = JSON.stringify({ title: 'Sample Chat App', msgFromServer : dataToSave.webPush});

                webpush.sendNotification(subscription, payload).catch(error => {
                    console.error(error.stack);
                });
            }


        }
    })
})

module.exports = {
    loginUser,
    updateSubscription,
    getUserViaId
};
