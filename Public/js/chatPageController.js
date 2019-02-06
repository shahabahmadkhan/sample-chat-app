angular.module('chatApp').controller('chatPageController',
    ['$scope', '$rootScope', '$window', '$location', '$http', 'growl',
        function ($scope, $rootScope, $window, $location, $http, growl) {

            // $scope.name = null;
            // let user = angular.fromJson(window.localStorage['user_info']);
            // if (user && user.userDetails && user.userDetails.name) {
            //     $scope.name = user.userDetails.name;
            // } else {
            //     //clearCookiesAndLogout();
            // }

            $scope.currentUserDetails = {
                userId: 'id2',
                userFullName: 'Shahab Ahmad Khan',
                userImage: 'http://i.pravatar.cc/150?u=fake5@pravatar.com'
            };
            $scope.activeChatUserId = 'idxyz';
            $scope.openChatDetails = function(key){
                if ($scope.listOfRecentChats.hasOwnProperty(key)){
                    $scope.listOfRecentChats[$scope.activeChatUserId].activeSession = false;
                    $scope.activeChatUserId = key;
                    $scope.listOfRecentChats[key].activeSession = true;
                }

            };
            $scope.listOfRecentChats = {
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
                if (socket) {
                    socket.removeAllListeners();
                }
            });
        }
    ]
);
