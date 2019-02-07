angular.module('chatApp').controller('chatPageController',
    ['$scope', '$rootScope', '$window', '$state', '$http', 'growl',
        function ($scope, $rootScope, $window, $state, $http, growl) {
            $scope.listOfRecentChats = {};
            $scope.availableUsers = {};
            $scope.newChatText = null;
            $scope.activeChatUserId = null;
            
            let userInfoData = angular.fromJson(window.localStorage['user_info']);
            if (userInfoData && userInfoData.userDetails.user_id) {
                console.log('userInfoData.userDetails', userInfoData.userDetails)
                //all ok
                $scope.availableUsers = userInfoData.userDetails.availableUsers;
                if (userInfoData.userDetails.recentChatUserList && userInfoData.userDetails.recentChatUserList.length) {
                    userInfoData.userDetails.recentChatUserList.forEach(function (user_id) {
                        $scope.listOfRecentChats[user_id] = $scope.availableUsers[user_id];
                    })
                }
            } else {
                clearCookiesAndLogout();
                $state.go('home');
            }

            function sendChatMsg(username, chatMsg) {
                let userId = $scope.availableUsers[username]._id;
                $scope.listOfRecentChats[userId] = $scope.availableUsers[username];
                let chatMsgObj = {
                    chatTxt: chatMsg,
                    direction: 'sent',
                    time: moment(new Date()).fromNow()
                };
                $scope.listOfRecentChats[userId].chatArray.push(chatMsgObj);
                $scope.openChatDetails(userId);
                $scope.newChatText = null;
            }

            function sendChatMsgViaUserId(userId, chatMsg) {
                let chatMsgObj = {
                    chatTxt: chatMsg,
                    direction: 'sent',
                    time: moment(new Date()).fromNow()
                };
                $scope.listOfRecentChats[userId].chatArray.push(chatMsgObj);
                $scope.newChatText = null;
            }

            $scope.sendMsg = function () {
                if ($scope.newChatText.trim().indexOf('@') === 0) {
                    //it is referring to a particular username from availableUserArray
                    let username = $scope.newChatText.split(' ')[0].trim().split('@')[1];
                    if ($scope.availableUsers.hasOwnProperty(username)) {
                        //start a new chat session and send the first msg there
                        let chat_msg = $scope.newChatText.replace('@' + username, '');
                        sendChatMsg(username, chat_msg);
                    } else {
                        growl.error('User: ' + username + ' Not Found')
                    }
                } else {
                    //when already active session is there
                    if ($scope.activeChatUserId) {
                        //all ok
                        sendChatMsgViaUserId($scope.activeChatUserId,$scope.newChatText);
                        //perform send msg task via socket
                    } else {
                        growl.error('Please enter @username to start a chat');
                    }
                }
            };

            $scope.currentUserDetails = userInfoData.userDetails;
            $scope.openChatDetails = function (key) {
                if ($scope.listOfRecentChats.hasOwnProperty(key)) {
                    if ($scope.activeChatUserId) {
                        $scope.listOfRecentChats[$scope.activeChatUserId].activeSession = false;
                    }
                    $scope.activeChatUserId = key;
                    $scope.listOfRecentChats[key].activeSession = true;
                }
            };


            $scope.logoutUser = function () {
                clearCookiesAndLogout();
                $state.go('home');
            };


            $scope.listOfRecentChats2 = {
                'idxyz':
                    {
                        userId: 'idxyz',
                        userFullName: 'Senior Manager',
                        currentStatus: 'Online',
                        activeSession: true,
                        userImage: 'http://i.pravatar.cc/150?u=fake@pravatar.com',
                        chatArray: [
                            {
                                chatTxt: 'Hi, How are you Sir?',
                                direction: 'sent',
                                time: moment(new Date(new Date().getTime() - (5 * 50 * 1000))).fromNow()
                            },
                            {
                                chatTxt: 'Hi, Buddy i am good, How about You?',
                                direction: 'received',
                                time: moment(new Date(new Date().getTime() - (4.5 * 50 * 1000))).fromNow()
                            },
                            {
                                chatTxt: 'I am good, This Chat App Is Cool.',
                                direction: 'sent',
                                time: moment(new Date(new Date().getTime() - (4 * 50 * 1000))).fromNow()
                            },
                            {
                                chatTxt: 'Really? Thanks a lot.',
                                direction: 'received',
                                time: moment(new Date(new Date().getTime() - (3.5 * 50 * 1000))).fromNow()
                            },
                            {
                                chatTxt: 'So hows everything else?',
                                direction: 'sent',
                                time: moment(new Date(new Date().getTime() - (3 * 50 * 1000))).fromNow()
                            },
                            {
                                chatTxt: "All is well, Let's meet this weekend.",
                                direction: 'received',
                                time: moment(new Date(new Date().getTime() - (2.5 * 50 * 1000))).fromNow()
                            },
                            {
                                chatTxt: 'Ahh.. I am not free this weekend, How about the next weekend?',
                                direction: 'sent',
                                time: moment(new Date(new Date().getTime() - (2 * 50 * 1000))).fromNow()
                            },
                            {
                                chatTxt: "Cool, Let's do it.",
                                direction: 'received',
                                time: moment(new Date(new Date().getTime() - (1.5 * 50 * 1000))).fromNow()
                            },
                        ]
                    },
                'idabc': {
                    userId: 'idabc',
                    activeSession: false,
                    userFullName: 'HR Manager',
                    userImage: 'http://i.pravatar.cc/150?u=fake1@pravatar.com',
                    chatArray: [
                        {
                            chatTxt: 'Yo,Wassup?',
                            direction: 'sent',
                            time: moment(new Date(new Date().getTime() - (5 * 50 * 1000))).fromNow()
                        },
                        {
                            chatTxt: 'Yo, Doing Good',
                            direction: 'received',
                            time: moment(new Date(new Date().getTime() - (4.5 * 50 * 1000))).fromNow()
                        }
                    ]
                }

            };


            $scope.$on('$destroy', function (event) {
                if (window.socket) {
                    socket.removeAllListeners();
                }
            });
        }
    ]
);
