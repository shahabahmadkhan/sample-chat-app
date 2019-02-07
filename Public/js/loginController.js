angular.module('chatApp').controller('loginController',
    ['$scope', '$rootScope', '$window', '$location', '$http', 'growl', '$state',
        function ($scope, $rootScope, $window, $location, $http, growl, $state) {
            $scope.validLogin = false;
            $scope.username = null;
            $scope.password = null;
            let userInfoData = angular.fromJson(window.localStorage['user_info']);
            if (userInfoData && userInfoData.userDetails.user_id) {
                $scope.validLogin = true;
            }

            $scope.$on('$destroy', function (event) {
                if (window.socket) {
                    socket.removeAllListeners();
                }
            });
            let validateLoginForm = function () {
                if ($scope.username && $scope.username.length && $scope.username === 'shahab') {

                } else {
                    growl.error('Invalid Username');
                    return null;
                }
                if ($scope.password && $scope.password.length && $scope.password === '098098') {

                } else {
                    growl.error('Invalid Password');
                    return null;
                }
                $scope.validLogin = true;
                let dummyUserData = {
                    userId: 'id2',
                    userFullName: 'Shahab Ahmad Khan',
                    userImage: 'http://i.pravatar.cc/150?u=fake5@pravatar.com'
                };
                window.localStorage['user_info'] = JSON.stringify(dummyUserData);
                growl.success('Login Successful');
                setTimeout(function () {
                    $state.go('chat');
                }, 1000)


            };
            $scope.initiateLogin2 = function () {
                console.log('user>>', $scope.username);
                console.log('pass>>', $scope.password);
                validateLoginForm();
            }

            $scope.initiateLogin = function () {
                if ($scope.username && $scope.username.length > 3 && $scope.password && $scope.password.length > 3) {//TODO better validation
                    let dataToSend = {};
                    dataToSend.username = $scope.username;
                    dataToSend.password = $scope.password;
                    $http({
                        method: 'POST',
                        data: dataToSend,
                        config: config,
                        url: baseAPIurl + 'user/login'
                    }).then(function successCallback(response) {
                        if (response.data.status === 'failure' || response.data.statusCode === 401 || response.data.statusCode === 500){
                            growl.error(response.data.message,{ ttl: 5000});
                        }else {
                            if (response.data && response.data.userData && response.data.userData.accessToken){
                                window.localStorage['user_info'] = JSON.stringify(response.data.userData);
                                growl.success('Login Success',{ ttl:2000});
                                setTimeout(function () {
                                    $state.go('chat');
                                }, 1000)
                            }else {
                                growl.error(response.data.message)
                            }

                        }
                    }, function errorCallback(response) {

                    });
                }else {
                    growl.error('Invalid Credentials',{ ttl: 5000});
                }

            };

        }
    ]
);
