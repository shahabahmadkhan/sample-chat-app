const Joi = require('joi');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const hashPassword = function (plain_text, cb) {
    bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(plain_text, salt, cb);
    });
};

let authorizationHeaderObj = Joi.object({
    authorization: Joi.string().required()
}).unknown();


module.exports = {
    hashPassword,
    authorizationHeaderObj
};
