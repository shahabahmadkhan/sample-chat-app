let baseAPIurl = '/api/';

let globalSafeApply = ($scope, globalFn) => {
    $scope.safeApply = function (fn) {
        let phase = this.$root && this.$root.$$phase;
        if (phase == '$apply' || phase == '$digest') {
            if (fn && (typeof (fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };
    return $scope.safeApply(globalFn);
};

let clearCookiesAndLogout = function () {
    delete window.localStorage['user_info'];
    //window.location.href = "/";
};

let verifyCurrentSession = (token, callback) => {
    $.ajax({
        url: baseAPIurl + 'getUser',
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        },
        success: function (response) {
            callback(null, response)
        },
        error: function (error) {
            if (error.status === 401) {
                return clearCookiesAndLogout() // Logout on 401 errors
            }
            callback(error)
        },
    });
};

let angularUIStates = {
    'home': {
        url: '/',
        templateUrl: "partials/login.html",
        controller: 'loginController'
    },
    'chat': {
        url: '/chat',
        templateUrl: "partials/chat.html",
        controller: 'chatPageController'
    }
}

let chatApp = angular.module('chatApp', ['ui.router', 'angular-growl', 'ngScrollbars']).config(['$locationProvider', '$stateProvider', '$urlRouterProvider', 'ScrollBarsProvider', function ($locationProvider, $stateProvider, $urlRouterProvider, ScrollBarsProvider) {
    $locationProvider.html5Mode({requireBase: false, enabled: true});
    ScrollBarsProvider.defaults = {
        autoHideScrollbar: false,
        theme: 'light',
        advanced: {
            updateOnContentResize: true
        },
        setHeight: window.innerHeight - 50,
        scrollInertia: 0
    };
    for (let stateURI in angularUIStates) {
        $stateProvider.state(stateURI, angularUIStates[stateURI])
    }
    $urlRouterProvider.otherwise("/");
}]).run(['$rootScope', '$location', '$http', '$window', '$state',
    function ($rootScope, $location, $http, $window, $state) {

        let userInfoData = window.localStorage['user_info'] && window.localStorage['user_info'] != "undefined" && JSON.parse(window.localStorage['user_info']) || null;
        $rootScope.accessToken = null;
        if (userInfoData && userInfoData.userDetails) {
            verifyCurrentSession(userInfoData.accessToken, function (err, data) {
                if (!err) {
                    globalSafeApply($rootScope, function () {
                        $rootScope.currentUserDetails = userInfoData.userDetails;
                        $rootScope.accessToken = userInfoData.accessToken;
                        $state.go('chat')
                    })
                } else {
                    globalSafeApply($rootScope, function () {
                        $rootScope.currentUserDetails = {};
                        $rootScope.accessToken = null;
                    })

                }
            })

        } else {
            $rootScope.currentUserDetails = {};
            $rootScope.accessToken = null;
        }
    }]);
;
