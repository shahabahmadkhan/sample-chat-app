'use strict';
const chatService = require('../Services').Chats;
const APP_CONSTANTS = require('../Config/appConstants');
const mongoose = require('mongoose');

const getPaginatedChats = (payloadData, cb) => {
    //TODO add pagination
    let criteria = {
        $or: [{
            from_user_id: payloadData.current_user_id,
            to_user_id: payloadData.other_user_id
        }, {
            from_user_id: payloadData.other_user_id,
            to_user_id: payloadData.current_user_id
        }]

    };
    let projection = {__v: 0, _id: 0};
    chatService.getChats(criteria, projection, {lean: true, sort: {createdAt: -1}}, function (err, result) {
        if (err) {
            cb(APP_CONSTANTS.STATUS_MSG.ERROR.NOT_FOUND)
        } else {
            cb(null, result || []);
        }
    });
};

const insertChat = (payloadData, cb) => {
    let objToSave = {
        from_user_id: payloadData.from_user_id,
        to_user_id: payloadData.to_user_id,
        chatTxt: payloadData.chatTxt
    };
    chatService.createChat(objToSave, cb)
};

process.on('chatMsgReceived', function (payloadData) {
    if (payloadData.from_user_id) {
        payloadData.from_user_id = mongoose.Types.ObjectId(payloadData.from_user_id);
    }
    if (payloadData.to_user_id) {
        payloadData.to_user_id = mongoose.Types.ObjectId(payloadData.to_user_id);
    }
    insertChat(payloadData, function (err, data) {
    })
});

module.exports = {
    getPaginatedChats,
    insertChat
};
