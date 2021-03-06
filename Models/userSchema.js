'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userModel = new Schema({
    username: { type: String, required: true, index: { unique: true } },
    userFullName : {type: String, required: true},
    password: { type: String, required: true },
    subscriptionData : {type: String},
    userImage : {type: String},
});

module.exports = mongoose.model('User', userModel);
