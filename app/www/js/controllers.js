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

        // TODO: this does not confirm if the session is still valid

        // TODO: session is NOT valid; need to re-log in on resume

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

        // Check if user has already authenticated
        // TODO: do this ONLY on app resume
        var loggedInUserId = localStorage.getItem(LOGGED_IN_USER_ID_KEY);
        if (loggedInUserId != null) {
            var loggedInUserPassword = localStorage.getItem(LOGGED_IN_USER_PWD_KEY);
            $scope.formData.j_username = loggedInUserId;
            $scope.formData.j_password = loggedInUserPassword;

            // Authenticate with server
            login($scope.formData);
        }   
    }
])

.controller('WritePostCtrl', ['$scope', '$http', 'slingHostURI',
    function($scope, $http, slingHostURI) {
        $scope.formData = {};

        // Camera functionality built upon https://github.com/ccoenraets/PictureFeed
        var cameraDefaultOptions = {
            quality: 45,
            targetWidth: 1000,
            targetHeight: 1000,
            destinationType: Camera.DestinationType.FILE_URI,
            encodingType: Camera.EncodingType.JPEG
        };

        $scope.takePicture = function() {
            var options = cameraDefaultOptions;
            options.sourceType = Camera.PictureSourceType.CAMERA;

            navigator.camera.getPicture(
                function (imageURI) {
                    console.log(imageURI);
                    $scope.imageURI = imageURI;
                },
                function (message) {
                    // We typically get here because the use canceled the photo operation. Fail silently.
                }, options);
        };

        $scope.choosePicture = function() {
            var options = cameraDefaultOptions;
            options.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;

            navigator.camera.getPicture(
                function (imageURI) {
                    console.log(imageURI);
                    $scope.imageURI = imageURI;
                },
                function (message) {
                    // We typically get here because the use canceled the photo operation. Fail silently.
                }, options);
        };

        $scope.processPost = function() {
            // TODO: handle case where user has not selected an image

            var ft = new FileTransfer(),
                options = new FileUploadOptions();

            options.fileKey = "attachments/*";
            options.fileName = 'filename.jpg';
            options.mimeType = "image/jpeg";
            options.chunkedMode = false;
            options.params = { // Whatever you populate options.params with, will be available in req.body at the server-side.
                title: $scope.formData.title || 'Untitled',
                posttext: $scope.formData.posttext || '',
                created: ''
            };

            console.log('Creating post with title: [' + options.params.title 
                + '], posttext: [' + options.params.posttext 
                + '] and imageURI: [' + $scope.imageURI + '].');

            ft.upload($scope.imageURI, slingHostURI + "/content/espblog/posts/*.edit.html",
                function (e) {
                    // TODO: handle success
                },
                function (e) {
                    // TODO: handle failure
                    alert("Upload failed");
                }, options);
        };

    }
])
