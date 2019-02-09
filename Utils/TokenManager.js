'use strict';

let redisConfig = require('../Config/dbConfig')[process.env.NODE_ENV + '_config'].redis;
const APP_CONSTANTS = require('../Config/appConstants');
let Jwt = require('jsonwebtoken');

//Connect To Redis
let redis = require('redis');
let redisClient = null;
if (process.env.NODE_ENV === 'dev'){
    redisClient = redis.createClient(redisConfig.port, redisConfig.URI);
}else {
    //configuration for heroku deployment
    let rtg   = require("url").parse(process.env.REDISTOGO_URL);
    redisClient = require("redis").createClient(rtg.port, rtg.hostname);
    redisClient.auth(rtg.auth.split(":")[1]);
}
redisClient.on('error', function (err) {
    console.log('Error ' + err);
});

redisClient.on('connect', function () {
    console.log('Redis is ready');
});


// Middleware for token verification
let getTokenFromRedis = function (key, callback) {
    redisClient.get(key, function (err, data) {
        if (err) {
            console.log(err);
            callback(err);
        } else {
            callback(null, data)
        }

    });
};

let setTokenInRedis = function (key, value, callback) {
    key = key.toString();
    redisClient.set(key, value, function (err, data) {
        if (err) {
            console.log(err);
            callback(err);
        } else {
            callback(null, data)
        }
    });
};

let expireTokenInRedis = function (key, callback) {
    if (key != null) {
        redisClient.expire(key, 0, function (err, data) {
            callback(err, data);
        });
    }
};

let verifyToken = function (token, callback) {
    let response = {
        valid: false
    };
    Jwt.verify(token, APP_CONSTANTS.SERVER.JWT_SECRET_KEY, function (err, decoded) {
        if (err) {
            if (err.name == 'TokenExpiredError') {
                return callback(APP_CONSTANTS.STATUS_MSG.ERROR.TOKEN_ALREADY_EXPIRED)
            }
            response.name = err.name
            callback(APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN)
        } else {
            getTokenFromRedis(decoded.id, function (err, data) {
                if (!err && data && data == token) {
                    response.valid = true;
                    response.userData = decoded;
                    callback(null, response);
                } else {
                    callback(APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN)
                }
            });
        }
    });
};

let setToken = function (tokenData, callback) {
    if (!tokenData.id) {
        callback(APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    } else {
        let tokenToSend = Jwt.sign(tokenData, APP_CONSTANTS.SERVER.JWT_SECRET_KEY, {
            expiresIn: 86400 // expires in 24 hours
        });
        setTokenInRedis(tokenData.id, tokenToSend, function (err, data) {
            callback(err, {accessToken: tokenToSend})
        })
    }
};
let expireToken = function (token, callback) {
    Jwt.verify(token, APP_CONSTANTS.SERVER.JWT_SECRET_KEY, function (err, decoded) {
        if (err) {
            if (err.name == 'TokenExpiredError') {
                return callback(APP_CONSTANTS.STATUS_MSG.ERROR.TOKEN_ALREADY_EXPIRED)
            }
            callback(APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN);
        } else {
            expireTokenInRedis(decoded.id, function (err, data) {
                callback(err, data)
            });
        }
    });
};

let decodeToken = function (token, callback) {
    Jwt.verify(token, APP_CONSTANTS.SERVER.JWT_SECRET_KEY, function (err, decodedData) {
        if (err) {
            if (err.name == 'TokenExpiredError') {
                return callback(APP_CONSTANTS.STATUS_MSG.ERROR.TOKEN_ALREADY_EXPIRED)
            }
            callback(APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN);
        } else {
            callback(null, decodedData)
        }
    })
};


module.exports = {
    expireToken,
    setToken,
    verifyToken,
    decodeToken
};
