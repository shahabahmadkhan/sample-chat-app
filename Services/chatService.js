'use strict';

let Models = require('../Models');

//Get Chat from DB
let getChats = function (criteria, projection, options, callback) {
    Models.Chats.find(criteria, projection, options, callback);
};

let getDistinctValues = function(field,criteria,callback){
    Models.Chats.distinct(field,criteria,callback)
};

//Insert Chat in DB
let createChat = function (objToSave, callback) {
    new Models.Chats(objToSave).save(callback)
};

//Update Chat in DB
let updateChat = function (criteria, dataToSet, options, callback) {
    Models.Chats.findOneAndUpdate(criteria, dataToSet, options, callback);
};


module.exports = {
    getChats,
    createChat,
    getDistinctValues,
    updateChat
};
