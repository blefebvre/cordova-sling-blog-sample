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

.factory('userCredentialsValidation', ['$http', 'slingHostURI', 'formDataObject', 'loggedInUserIdKey', 'loggedInUserPwdKey',
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

// Based on http://wemadeyoulook.at/en/blog/implementing-basic-http-authentication-http-requests-angular/
.factory('basicAuthentication', ['Base64', '$cookieStore', '$http', 
    function (Base64, $cookieStore, $http) {
        // initialize to whatever is in the cookie, if anything
        $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookieStore.get('authdata');
     
        return {
            setCredentials: function (username, password) {
                var encoded = Base64.encode(username + ':' + password);
                $http.defaults.headers.common.Authorization = 'Basic ' + encoded;
                $cookieStore.put('authdata', encoded);
            },
            clearCredentials: function () {
                document.execCommand("ClearAuthenticationCache");
                $cookieStore.remove('authdata');
                $http.defaults.headers.common.Authorization = 'Basic ';
            }
        };
    }
])
.factory('Base64', function() {
    var keyStr = 'ABCDEFGHIJKLMNOP' +
        'QRSTUVWXYZabcdef' +
        'ghijklmnopqrstuv' +
        'wxyz0123456789+/' +
        '=';
    return {
        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;
 
            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
 
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;
 
                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }
 
                output = output +
                    keyStr.charAt(enc1) +
                    keyStr.charAt(enc2) +
                    keyStr.charAt(enc3) +
                    keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);
 
            return output;
        },
 
        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;
 
            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                alert("There were invalid base64 characters in the input text.\n" +
                    "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                    "Expect errors in decoding.");
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
 
            do {
                enc1 = keyStr.indexOf(input.charAt(i++));
                enc2 = keyStr.indexOf(input.charAt(i++));
                enc3 = keyStr.indexOf(input.charAt(i++));
                enc4 = keyStr.indexOf(input.charAt(i++));
 
                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;
 
                output = output + String.fromCharCode(chr1);
 
                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }
 
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
 
            } while (i < input.length);
 
            return output;
        }
    };
})

// TODO: remove (as per https://github.com/blefebvre/cordova-sling-blog-sample/issues/6)
.run(['$rootScope', 'slingHostURI', 'userCredentialsValidation', 'loggedInUserIdKey', 'loggedInUserPwdKey', 
    function($rootScope, slingHostURI, userCredentialsValidation, loggedInUserIdKey, loggedInUserPwdKey) {
        // Log in if credentials are available
        var loggedInUserId = localStorage.getItem(loggedInUserIdKey);
        if (loggedInUserId != null) {
            var loggedInUserPassword = localStorage.getItem(loggedInUserPwdKey);

            // Authenticate with server
            userCredentialsValidation.login(loggedInUserId, loggedInUserPassword, 
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