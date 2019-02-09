const async= require('async');
const userService = require('../Services/userService');
const UniversalFunctions = require('./UniversalFunctions');

let defaultUsersArray = [
    {
        username: 'shahab',
        password : '098098',
        userFullName : 'Shahab Khan',
        userImage : 'http://i.pravatar.cc/150?u=fake11@pravatar.com'
    },
    {
        username: 'zeba',
        password : '098098',
        userFullName : 'Zeba HR',
        userImage : 'http://i.pravatar.cc/150?u=fake1@pravatar.com'
    },
    {
        username: 'vikram',
        password : '098098',
        userFullName : 'Vikram',
        userImage : 'http://i.pravatar.cc/150?u=fake8@pravatar.com'
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
                        console.log('already bootstrapped');
                    }
                    cb()
                })
            },
            'insertUsers' : ['checkIfAlreadyBootStrapped', function (res, cb) {
                if (alreadyBootstrappedFlag){
                    return cb()
                }else {
                    console.log("bootstrapping user")
                    async.each(defaultUsersArray,function (userObj,internalCB) {
                        UniversalFunctions.hashPassword(userObj.password, function (err, hashedPassword) {
                            if (err){
                                internalCB(err)
                            }else {
                                userObj.password = hashedPassword; // password hashing of plain text
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
