angular.module('starter.controllers', ['starter.services'])

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

.controller('AccountCtrl', ['$scope', '$rootScope', '$http', 'formDataObject', 'slingHostURI', 'loggedInUserIdKey', 'loggedInUserPwdKey', 'userAuthentication',
    function($scope, $rootScope, $http, formDataObject, slingHostURI, loggedInUserIdKey, loggedInUserPwdKey, userAuthentication) {
        $scope.formData = {
            j_username: '',
            j_password: ''
        };

        $scope.processLogin = function() {
            userAuthentication.login($scope.formData.j_username, $scope.formData.j_password,
                function callback(error, username) {
                    if (error) {
                        $scope.loginErrorMessage = error;
                        return;
                    }

                    $scope.loginErrorMessage = null;
                    $rootScope.currentLoggedInUser = username;
                });
        };

        $scope.logout = function() {

            // TODO: move logout to userAuthentication
            $http.get(slingHostURI + '/system/sling/logout')
                .success(function(data, status) {
                    console.log('Logout success');
                    localStorage.removeItem(loggedInUserIdKey);
                    localStorage.removeItem(loggedInUserPwdKey);
                    $scope.currentLoggedInUser = null;
                })
                .error(function(data, status) {
                    console.error('Logout failed. Status: [' + status + '], Message: [' + data + '].');
                });
        };
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
