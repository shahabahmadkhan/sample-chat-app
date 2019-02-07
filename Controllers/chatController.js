'use strict';
const chatService = require('../Services').Chats;
const APP_CONSTANTS = require('../Config/appConstants');

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
    chatService.getChats(criteria, projection, {lean: true}, function (err, result) {
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
        txtMsg: payloadData
    };
    chatService.createChat(objToSave, cb)
};

module.exports = {
    getPaginatedChats,
    insertChat
};
