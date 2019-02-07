'use strict';

let Models = require('../Models');

//Get User from DB
let getUser = function (criteria, projection, options, callback) {
    Models.Users.find(criteria, projection, options, callback);
};

//Count number of users

let countUsers = function(criteria, callback){
    Models.Users.countDocuments(criteria,callback)
};

//Insert User in DB
let createUser = function (objToSave, callback) {
    new Models.Users(objToSave).save(callback)
};

//Update User in DB
let updateUser = function (criteria, dataToSet, options, callback) {
    Models.Users.findOneAndUpdate(criteria, dataToSet, options, callback);
};


module.exports = {
    getUser,
    countUsers,
    updateUser,
    createUser
};
