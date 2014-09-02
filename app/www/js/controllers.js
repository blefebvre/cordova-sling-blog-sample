angular.module('starter.controllers', ['starter.services'])

// Sling instance hostname
.constant('slingHostURI', 'http://localhost:8080')

.controller('BlogCtrl', ['$scope', '$http', 'slingHostURI',
    function($scope, $http, slingHostURI) {
        // Assume we're connected until proven otherwise
        $scope.connected = true;

        var fetchBlogPostList = function() {
            // Fetch blog post list in JSON format from our sling host
            $http.get(slingHostURI + '/content/espblog/posts.list.json')
                .success(function(data, status) {
                    $scope.connected = true;
                    $scope.blogPostList = data.posts;
                })
                .error(function(data, status) {
                    $scope.connected = false;
                    console.error('Blog post list fetch failed. Status: [' + status + '], Message: [' + data + '].');
                });
        };

        $scope.fetchBlogPost = function(postURI) {
            $http.get(slingHostURI + '/content/espblog/posts.list.json')
                .success(function(data, status) {
                    $scope.blogPostList = data.posts;
                })
                .error(function(data, status) {
                    console.error('Blog post fetch failed. Status: [' + status + '], Message: [' + data + '].');
                });
        };

        // Fetch initial post list
        fetchBlogPostList();
    }
])

.controller('AccountCtrl', ['$scope', '$http', 'formDataObject', 'slingHostURI',
    function($scope, $http, formDataObject, slingHostURI) {

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
            $http.get(slingHostURI + '/system/sling/logout')
                .success(function(data, status) {
                    console.log('Logout success');
                    localStorage.removeItem(LOGGED_IN_USER_ID_KEY);
                    localStorage.removeItem(LOGGED_IN_USER_PWD_KEY);
                    $scope.currentLoggedInUser = null;
                })
                .error(function(data, status) {
                    console.error('Logout failed. Status: [' + status + '], Message: [' + data + '].');
                });
        };

        /**
         * Private helpers
         */
        var login = function(formData) {
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
                    $scope.loginErrorMessage = null;
                    if (status == 200) {
                        console.log('Login SUCCESS for user [' + formData.j_username + ']');
                        localStorage.setItem(LOGGED_IN_USER_ID_KEY, formData.j_username);
                        localStorage.setItem(LOGGED_IN_USER_PWD_KEY, formData.j_password);
                        $scope.currentLoggedInUser = formData.j_username;
                    } else {
                        console.log('Interesting status: ' + status);
                    }
                })
                .error(function(data, status) {
                    console.error('Login failed. Status: [' + status + '], Message: [' + data + '].');
                    $scope.loginErrorMessage = data;
                });
        };
    }
]);
