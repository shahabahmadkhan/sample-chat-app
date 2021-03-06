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

            function scrollChatToBottom() {
                $("#msg_container_base").mCustomScrollbar("update");
                setTimeout(function () {
                    $("#msg_container_base").mCustomScrollbar("scrollTo", "bottom");
                }, 10);
            }

            socket.on("reconnect", function () {
                console.log("Reconnecting");
                sendSocketAuth()
            });

            let accessToken = window.localStorage['user_info'] && window.localStorage['user_info'] != "undefined" && JSON.parse(window.localStorage['user_info']).accessToken || null;

            function fetchRecentChatUsers() {
                $http({
                    method: 'GET',
                    headers: {'authorization': 'Bearer ' + JSON.parse(window.localStorage['user_info']).accessToken},
                    config: config,
                    url: baseAPIurl + 'chat/getRecentUserArray'
                }).then(function successCallback(response) {
                    if (response.data.status == 'failure' || response.data.statusCode == 400) {
                        growl.error(response.data.message, {ttl: 5000});
                    } else {
                        globalSafeApply($scope, function () {
                            if (userInfoData && userInfoData.userDetails.user_id) {
                                //all ok
                                $scope.availableUsers = userInfoData.userDetails.availableUsers;
                                if (response.data.recentChatArray) {
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
                        growl.success('Fetched Successfully', {ttl: 5000});


                    }
                }, globalErrorCallback);
            }

            if (accessToken) {
                fetchRecentChatUsers();

                if ('serviceWorker' in navigator && Notification.permission !== 'granted') {
                    console.log('Registering service worker');

                    if ('serviceWorker' in navigator) {
                        console.log('Registering service worker');

                        navigator.serviceWorker.register('/worker.js')
                            .then(function(registration) {
                                // Use the PushManager to get the user's subscription to the push service.
                                return registration.pushManager.getSubscription()
                                    .then(function(subscription) {
                                        // If a subscription was found, return it.
                                        if (subscription) {
                                            return subscription;
                                        }

                                        // Otherwise, subscribe the user (userVisibleOnly allows to specify that we don't plan to
                                        // send notifications that don't have a visible effect for the user).
                                        return registration.pushManager.subscribe({ userVisibleOnly: true , applicationServerKey: urlBase64ToUint8Array(publicVapidKey)});
                                    });
                            }).then(function(subscription) {
                            // send to server...
                            console.log('Registered push');

                            console.log('Sending push');
                            let dataToSend = {};
                            dataToSend.subscription = JSON.stringify(subscription);
                            $http({
                                method: 'POST',
                                data: dataToSend,
                                withCredentials: true,
                                headers: {'authorization': 'Bearer ' + JSON.parse(window.localStorage['user_info']).accessToken},
                                config: config,
                                url: baseAPIurl + 'user/subscribe'
                            }).then(function successCallback(response) {
                            }, globalErrorCallback);

                            console.log('Sent push');
                        });

                        // run().catch(error => console.error(error));
                    }
                    //run().catch(error => console.error(error));
                }
                //
                // async function run() {
                //     console.log('Registering service worker');
                //     const registration = await navigator.serviceWorker.register('/worker.js', {scope: '/'});
                //     console.log('Registered service worker');
                //
                //     console.log('Registering push');
                //     const subscription = await registration.pushManager.subscribe({
                //         userVisibleOnly: true,
                //         // The `urlBase64ToUint8Array()` function is the same as in
                //         // https://www.npmjs.com/package/web-push#using-vapid-key-for-applicationserverkey
                //         applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
                //     });
                //     console.log('Registered push', subscription);
                //
                //     console.log('Sending push');
                //     let dataToSend = {};
                //     dataToSend.subscription = JSON.stringify(subscription);
                //     $http({
                //         method: 'POST',
                //         data: dataToSend,
                //         withCredentials: true,
                //         headers: {'authorization': 'Bearer ' + JSON.parse(window.localStorage['user_info']).accessToken},
                //         config: config,
                //         url: baseAPIurl + 'user/subscribe'
                //     }).then(function successCallback(response) {
                //         console.log('subscribe response>>>', response)
                //
                //     }, globalErrorCallback);
                //
                //     console.log('Sent push');
                // }
            } else {
                $state.go('home')
            }



            socket.on('incomingChatMsgForReceiver', function (data) {
                if ($scope.availableUsers.hasOwnProperty(data.from_username)){
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
                        if ($scope.activeChatUsername == null) {
                            growl.success('New Msg From : ' + $scope.availableUsers[data.from_username].userFullName)
                        }
                        console.log('data',data)
                        scrollChatToBottom();
                    })
                }

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
                if (openChatFlag) {
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

            $window.isTabActive = true;

            $window.onfocus = function () {
                isTabActive = true;
                let dataToEmit = {
                    token: accessToken,
                    isTabActive: true
                };
                socket.emit('pageFocusEvent', dataToEmit);
                console.log('focussed')
            };

            $window.onblur = function () {
                isTabActive = false;
                let dataToEmit = {
                    token: accessToken,
                    isTabActive: false
                };
                socket.emit('pageFocusEvent', dataToEmit)
                console.log('blurred')
            };

            $scope.sendMsgEventHandler = function () {
                if ($scope.newChatText.trim().indexOf('@') === 0) {
                    //it is referring to a particular username from availableUserArray
                    let username = $scope.newChatText.split(' ')[0].trim().split('@')[1];
                    if ($scope.availableUsers.hasOwnProperty(username)) {
                        //start a new chat session and send the first msg there
                        let chat_msg = $scope.newChatText.replace('@' + username, '');
                        if (chat_msg && chat_msg.length){
                            sendChatMsg(username, chat_msg, true);
                        }else {
                            growl.error('Enter some text to send');
                        }
                    } else {
                        if (username === $scope.currentUserDetails.username){
                            growl.error('You cannot send msg to yourself')
                        }else {
                            growl.error('User: ' + username + ' Not Found')
                        }
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
            if (userInfoData){
                $scope.currentUserDetails = userInfoData.userDetails;
            }

            function fetchChatArrayViaREST(user_id) {
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
                    if (response.data.status == 'failure' || response.data.statusCode == 400) {
                        growl.error(response.data.message, {ttl: 5000});
                    } else {
                        globalSafeApply($scope, function () {
                            $scope.listOfRecentChats[$scope.activeChatUsername].chatArray = response.data.chatMsgArray;
                        });
                        growl.success('Fetched Successfully', {ttl: 5000});
                        scrollChatToBottom()
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
                if ($scope.listOfRecentChats.hasOwnProperty($scope.activeChatUsername)){
                    $scope.listOfRecentChats[$scope.activeChatUsername].activeSession = false;
                }
                $scope.activeChatUsername = null;
                angular.element('#chat_box_text_input').focus();
            }
        }
    ]
);

