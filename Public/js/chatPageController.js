angular.module('chatApp').controller('chatPageController',
    ['$scope', '$rootScope', '$window', '$state', '$http', 'growl', 'moment',
        function ($scope, $rootScope, $window, $state, $http, growl, moment) {
            $scope.listOfRecentChats = {};
            $scope.availableUsers = {};
            $scope.newChatText = null;
            $scope.activeChatUsername = null;

            if (socket) {
                socket.removeAllListeners();
                connectSocketServer();
            }

            function scrollChatToBottom(){
                $("#msg_container_base").mCustomScrollbar("update");
                setTimeout(function(){
                    $("#msg_container_base").mCustomScrollbar("scrollTo","bottom");
                },10);
            }

            socket.on("reconnect", function() {
                console.log("Reconnecting");
                sendSocketAuth()
            });

            let accessToken = window.localStorage['user_info'] && window.localStorage['user_info'] != "undefined" && JSON.parse(window.localStorage['user_info']).accessToken || null;

            socket.on('incomingChatMsgForReceiver', function (data) {
                $scope.$apply(function () {
                    if (!$scope.listOfRecentChats.hasOwnProperty(data.from_username)) {
                        $scope.listOfRecentChats[data.from_username] = $scope.availableUsers[data.from_username];
                    }
                    //fill up the recent chat
                    let chatMsgObj = {
                        chatTxt: data.chatTxt,
                        direction: 'received',
                        time: moment(new Date()).fromNow()
                    };
                    $scope.listOfRecentChats[data.from_username].chatArray.push(chatMsgObj);
                    if ($scope.activeChatUsername == null){
                        growl.success('New Msg From : ' + $scope.availableUsers[data.from_username].userFullName)
                    }
                    scrollChatToBottom();
                })
            });

            function sendChatMsg(username, chatMsg, openChatFlag) {
                let userId = $scope.availableUsers[username]._id;
                $scope.listOfRecentChats[username] = $scope.availableUsers[username];
                let chatMsgObj = {
                    chatTxt: chatMsg,
                    direction: 'sent',
                    createdAt: new Date()
                };
                $scope.listOfRecentChats[username].chatArray.push(chatMsgObj);
                if (openChatFlag){
                    $scope.openChatDetails(username);
                }
                $scope.newChatText = null;
                let dataToEmit = {
                    token: accessToken,
                    receiver_id: userId,
                    chatMsg: chatMsg
                };
                if (socket) {
                    socket.emit('chatMsgFromClient', dataToEmit, function (response) {
                        if (response.type === 'error') {
                            growl.error(response.msg)
                        } else {
                            growl.success(response.msg)

                        }
                    })
                }
                scrollChatToBottom();

            }

            $scope.sendMsgEventHandler = function () {
                if ($scope.newChatText.trim().indexOf('@') === 0) {
                    //it is referring to a particular username from availableUserArray
                    let username = $scope.newChatText.split(' ')[0].trim().split('@')[1];
                    if ($scope.availableUsers.hasOwnProperty(username)) {
                        //start a new chat session and send the first msg there
                        let chat_msg = $scope.newChatText.replace('@' + username, '');
                        sendChatMsg(username, chat_msg, true);
                    } else {
                        growl.error('User: ' + username + ' Not Found')
                    }
                } else {
                    //when already active session is there
                    if ($scope.activeChatUsername) {
                        //all ok
                        sendChatMsg($scope.activeChatUsername, $scope.newChatText, false);
                        //perform send msg task via socket
                    } else {
                        growl.error('Please enter @username to start a chat');
                    }
                }
            };

            let userInfoData = angular.fromJson(window.localStorage['user_info']);
            $scope.currentUserDetails = userInfoData.userDetails;

            function fetchRecentChatUsers (){
                $http({
                    method: 'GET',
                    headers: {'authorization': 'Bearer ' + JSON.parse(window.localStorage['user_info']).accessToken},
                    config: config,
                    url: baseAPIurl + 'chat/getRecentUserArray'
                }).then(function successCallback(response) {
                    console.log('response>>>',response)
                    if (response.data.status == 'failure' || response.data.statusCode == 400) {
                        growl.error(response.data.message, {ttl: 5000});
                    } else {
                        globalSafeApply($scope, function () {
                            if (userInfoData && userInfoData.userDetails.user_id) {
                                //all ok
                                $scope.availableUsers = userInfoData.userDetails.availableUsers;
                                if (response.data.recentChatArray){
                                    userInfoData.userDetails.recentChatUserList = response.data.recentChatArray;
                                }
                                if (userInfoData.userDetails.recentChatUserList && userInfoData.userDetails.recentChatUserList.length) {
                                    userInfoData.userDetails.recentChatUserList.forEach(function (username) {
                                        $scope.listOfRecentChats[username] = $scope.availableUsers[username];
                                    })
                                }
                            } else {
                                clearCookiesAndLogout();
                                $state.go('home');
                            }
                        })
                        growl.success('Fetched Successfully',{ttl: 5000});


                    }
                }, globalErrorCallback);
            }

            fetchRecentChatUsers();

            function fetchChatArrayViaREST(user_id){
                console.log("fetching for>>>",user_id)
                let dataToSend = {};
                dataToSend.with_user_id = user_id;
                $http({
                    method: 'POST',
                    data: dataToSend,
                    withCredentials: true,
                    headers: {'authorization': 'Bearer ' + JSON.parse(window.localStorage['user_info']).accessToken},
                    config: config,
                    url: baseAPIurl + 'chat/getPaginatedChat'
                }).then(function successCallback(response) {
                    console.log('response>>>',response)
                    if (response.data.status == 'failure' || response.data.statusCode == 400) {
                        growl.error(response.data.message, {ttl: 5000});
                    } else {
                       globalSafeApply($scope, function () {
                           $scope.listOfRecentChats[$scope.activeChatUsername].chatArray = response.data.chatMsgArray;
                       });
                         growl.success('Fetched Successfully',{ttl: 5000});
                    }
                }, globalErrorCallback);
            }

            $scope.openChatDetails = function (key) {
                if ($scope.listOfRecentChats.hasOwnProperty(key)) {
                    if ($scope.activeChatUsername) {
                        $scope.listOfRecentChats[$scope.activeChatUsername].activeSession = false;
                    }
                    $scope.activeChatUsername = key;
                    $scope.listOfRecentChats[key].activeSession = true;
                    fetchChatArrayViaREST($scope.availableUsers[$scope.activeChatUsername]._id);
                    //TODO HIT API
                }
            };


            $scope.logoutUser = function () {
                clearCookiesAndLogout();
                $state.go('home');
            };


            $scope.$on('$destroy', function (event) {
                if (window.socket) {
                    socket.removeAllListeners();
                }
            });

            $scope.startNewChat = function () {
                $scope.activeChatUsername = null;
            }
        }
    ]
);
