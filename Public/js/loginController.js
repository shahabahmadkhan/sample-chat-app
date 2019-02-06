angular.module('chatApp').controller('loginController',
    ['$scope', '$rootScope', '$window', '$location', '$http', 'growl',
        function ($scope, $rootScope, $window, $location, $http, growl) {

            $scope.name = null;
            let user = angular.fromJson(window.localStorage['user_info']);
            if (user && user.userDetails && user.userDetails.name) {
                $scope.name = user.userDetails.name;
            }

            $scope.$on('$destroy', function (event) {
                if (socket) {
                    socket.removeAllListeners();
                }
            });
        }
    ]
);
