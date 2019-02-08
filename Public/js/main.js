let baseAPIurl = '/api/';

let socket = io('');

let sendSocketAuth = function(){
    let accessToken = window.localStorage['user_info'] && window.localStorage['user_info'] != "undefined" && JSON.parse(window.localStorage['user_info']).accessToken || null;
    socket.emit('clientAuth', {token: accessToken});
}

let connectSocketServer = () => {
    socket.connect();
    sendSocketAuth()
};

const globalErrorCallback = (response) => {
    console.log('globalerrorcallback', response)
    if (response.status == 401) {
       // clearCookiesAndLogout();
    }
}

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

$(document).ready(function () {

});

let verifyCurrentSession = (token, callback) => {
    return callback();
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
};
let config = {
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
    }
};

let chatApp = angular.module('chatApp', ['ui.router', 'angular-growl', 'ngScrollbars', 'angularMoment']).config(['$locationProvider', '$stateProvider', '$urlRouterProvider', 'ScrollBarsProvider', function ($locationProvider, $stateProvider, $urlRouterProvider, ScrollBarsProvider) {
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

chatApp.config(['growlProvider', function (growlProvider) {
    growlProvider.globalTimeToLive(5000);
    growlProvider.globalPosition('bottom-right');
}]);

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}


// Hard-coded, replace with your public key
const publicVapidKey = 'BLh8Z0nwpZHpGtgT6LxcS3rV568doumSj0_2n78PQKjBCBQIjgjF3YkskL4Vi1WMEF9wkmfMIIMHGei3gHSGr94';

