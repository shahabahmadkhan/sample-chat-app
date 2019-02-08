'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatModel = new Schema({
    from_user_id: {
        type: Schema.Types.ObjectId, ref: 'users', required:true, index: true
    },
    to_user_id: {
        type: Schema.Types.ObjectId, ref: 'users', required:true
    },
    readFlag : { type: Boolean, default: false }, // By default the msg will be unread
    chatTxt : {type: String, required: true},
    createdAt : { type: Date, default: Date.now},
});

chatModel.index({ from_user_id: 1, to_user_id: 1 });

module.exports = mongoose.model('Chat', chatModel);
