'use strict';
const async = require('async');
const bcrypt = require('bcrypt');
const userService = require('../Services').Users;

const TokenManager = require('../Lib/TokenManager');

const APP_CONSTANTS = require('../Config/appConstants');


const getDistinctChatUsers = (userId, cb) => {
    let userIdsOfVariousChats = [];

    let criteria = {
        from_user_id: userId
    };
    userService.findDistinctUserChats('to_user_id', criteria, function (err, result) {
        if (err) {
            cb(APP_CONSTANTS.STATUS_MSG.ERROR.NOT_FOUND)
        } else {
            userIdsOfVariousChats = result || [];
            cb(null, userIdsOfVariousChats);
        }
    });
};

const getPaginatedChats = (userId, cb) => {
    
};

module.exports = {
    loginUser
};
