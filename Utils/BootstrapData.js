const async= require('async');
const userService = require('../Services/userService');
const UniversalFunctions = require('./UniversalFunctions');

let defaultUsersArray = [
    {
        username: 'shahab',
        password : '098098',
        userFullName : 'Shahab Khan'
    },
    {
        username: 'zeba',
        password : '098098',
        userFullName : 'Zeba HR'
    }
];

const bootstrapDefaultUserData = function (callback) {
    let alreadyBootstrappedFlag = false;
    async.auto(
        {
            'checkIfAlreadyBootStrapped' : function (cb) {
                let criteria = {
                    username : {$in : ['shahab','zeba']}
                };
                userService.countUsers(criteria,function (err, count) {
                    if (!err && count === 2){
                        alreadyBootstrappedFlag = true
                        //already bootstrapped
                        //console.log('already bootstrapped');
                    }
                    cb()
                })
            },
            'insertUsers' : ['checkIfAlreadyBootStrapped', function (res, cb) {
                if (alreadyBootstrappedFlag){
                    return cb()
                }else {
                    async.each(defaultUsersArray,function (userObj,internalCB) {
                        UniversalFunctions.hashPassword(userObj.password, function (err, hashedPassword) {
                            if (err){
                                internalCB(err)
                            }else {
                                userObj.password = hashedPassword; // password hasing of plain text
                                userService.createUser(userObj,internalCB)
                            }
                        })
                    },cb)
                }
            }]
        }, function (err) {
            if (err){
                callback(err)
            }else {
                callback(null, 'Successfully Bootstrapped Default Data')
            }
        }

    )
};



module.exports = {
    bootstrapDefaultUserData
};
