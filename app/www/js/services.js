angular.module('starter.services', [])

// Sling instance hostname
.constant('slingHostURI', 'http://localhost:8080')
.constant('loggedInUserIdKey', 'loggedInUserId')
.constant('loggedInUserPwdKey', 'loggedInUserPassword')

.factory('formDataObject', function() {
    return function(data) {
        var fd = new FormData();
        angular.forEach(data, function(value, key) {
            fd.append(key, value);
        });
        return fd;
    };
})

.factory('userAuthentication', ['$http', 'slingHostURI', 'formDataObject', 'loggedInUserIdKey', 'loggedInUserPwdKey',
    function($http, slingHostURI, formDataObject, loggedInUserIdKey, loggedInUserPwdKey) {

        /**
         * Attempt to log in with the given credentials.
         */
        var login = function(username, password, callback) {

            var formData = {
                _charset_: "UTF-8",
                selectedAuthType: "form",
                resource: "/",
                j_validate: "true",
                j_username: username,
                j_password: password
            };
            
            $http({
                    method: 'POST',
                    url: slingHostURI + '/j_security_check', 
                    data: formData,
                    headers: {
                        'Content-Type': undefined
                    },
                    transformRequest: formDataObject
                })
                .success(function(data, status) {
                    if (status == 200) {
                        console.log('Login SUCCESS for user [' + formData.j_username + ']');
                        localStorage.setItem(loggedInUserIdKey, formData.j_username);
                        localStorage.setItem(loggedInUserPwdKey, formData.j_password);

                        // Callback with the authenticated username
                        return callback(null, formData.j_username);
                    } else {
                        return callback('Login status: [' + status + ']');
                    }
                })
                .error(function(data, status) {
                    console.error('Login failed. Status: [' + status + '], Message: [' + data + '].');
                    return callback(data);
                });
        };

        return {
            login: login
        };
    }
])

.run(['$rootScope', 'slingHostURI', 'userAuthentication', 'loggedInUserIdKey', 'loggedInUserPwdKey', 
    function($rootScope, slingHostURI, userAuthentication, loggedInUserIdKey, loggedInUserPwdKey) {
        // Log in if credentials are available
        var loggedInUserId = localStorage.getItem(loggedInUserIdKey);
        if (loggedInUserId != null) {
            var loggedInUserPassword = localStorage.getItem(loggedInUserPwdKey);

            // Authenticate with server
            userAuthentication.login(loggedInUserId, loggedInUserPassword, 
                function callback(error, username) {
                    if (error) {
                        // TODO: handle error
                        return;
                    }

                    $rootScope.currentLoggedInUser = username;
                });
        }   
    }
]);