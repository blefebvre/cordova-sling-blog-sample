angular.module('starter.controllers', ['starter.services'])

// Sling instance hostname
.constant('slingHost', 'http://localhost:8080')

.controller('BlogCtrl', function($scope) {
})

.controller('AccountCtrl', ['$scope', '$http', 'formDataObject', 'slingHost',
    function($scope, $http, formDataObject, slingHost) {

        var LOGGED_IN_USER_ID_KEY = "loggedInUserId";
        var LOGGED_IN_USER_PWD_KEY = "loggedInUserPassword";

        $scope.formData = {
            _charset_: "UTF-8",
            selectedAuthType: "form",
            resource: "/",
            j_username: "",
            j_password: "",
            j_validate: "true"
        };

        $scope.processLogin = function() {
            login($scope.formData);
        };

        $scope.logout = function() {
            $http.get(slingHost + '/system/sling/logout')
                .success(function(data, status) {
                    console.log('Logout success');
                    localStorage.removeItem(LOGGED_IN_USER_ID_KEY);
                    localStorage.removeItem(LOGGED_IN_USER_PWD_KEY);
                    $scope.currentLoggedInUser = null;
                })
                .error(function(data, status) {
                    console.error('Logout failed. Status: ' + status + ', Message: ' + data);
                });
        };

        /**
         * Private helpers
         */
        var login = function(formData) {
            $http({
                    method: 'POST',
                    url: slingHost + '/j_security_check', 
                    data: formData,
                    headers: {
                        'Content-Type': undefined
                    },
                    transformRequest: formDataObject
                })
                .success(function(data, status) {
                    $scope.loginErrorMessage = null;
                    if (status == 200) {
                        console.log('Login SUCCESS!');
                        localStorage.setItem(LOGGED_IN_USER_ID_KEY, formData.j_username);
                        localStorage.setItem(LOGGED_IN_USER_PWD_KEY, formData.j_password);
                        $scope.currentLoggedInUser = formData.j_username;
                    } else {
                        console.log('Interesting status: ' + status);
                    }
                })
                .error(function(data, status) {
                    console.error('Login failed. Status: ' + status + ', Message: ' + data);
                    $scope.loginErrorMessage = data;
                });
        };
    }
]);
