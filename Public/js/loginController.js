angular.module('chatApp').controller('loginController',
    ['$scope', '$rootScope', '$window', '$location', '$http', 'growl', '$state',
        function ($scope, $rootScope, $window, $location, $http, growl, $state) {
            $scope.validLogin = false;
            $scope.username = null;
            $scope.password = null;
            let user = angular.fromJson(window.localStorage['user_info']);
            if (user && user.userId) {
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
            $scope.initiateLogin = function () {
                console.log('user>>', $scope.username);
                console.log('pass>>', $scope.password);
                validateLoginForm();
            }
        }
    ]
);
