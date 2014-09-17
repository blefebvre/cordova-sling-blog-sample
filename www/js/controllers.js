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

.controller('AccountCtrl', ['$scope', '$rootScope', '$http', 'formDataObject', 'slingHostURI', 'userAuthentication',
    function($scope, $rootScope, $http, formDataObject, slingHostURI, userAuthentication) {
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
            userAuthentication.logout();
        };
    }
])

.controller('WritePostCtrl', ['$scope', '$http', '$state', 'slingHostURI', 'basicAuthentication',
    function($scope, $http, $state, slingHostURI, basicAuthentication) {
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
            if (!$scope.imageURI) {
                // User has not selected an image
                alert('Please choose an image');
                // TODO: handle this case
            }
            else {
                // User has selected an image
                var ft = new FileTransfer(),
                    options = new FileUploadOptions();

                options.fileKey = "attachments/*";
                options.fileName = 'filename.jpg';
                options.mimeType = "image/jpeg";
                options.chunkedMode = false;
                options.headers = {
                    Authorization: basicAuthentication.getAuthorizationHeader()
                };
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
                        navigator.notification.alert('Done!',
                            function cb() {
                                $state.go('tab.blog');
                            },
                            'Upload status',
                            'Check it out'
                        );
                    },
                    function (e) {
                        // TODO: handle failure
                        navigator.notification.alert('Error: Upload failed.',
                            function cb() {
                                // No-op
                            },
                            'Upload status',
                            'Try again'
                        );
                    }, options);
            }
        };
    }
])

.controller('BlogCommentCtrl', ['$scope', '$http', '$state', 'slingHostURI', 'basicAuthentication',
    function($scope, $http, $state, slingHostURI, basicAuthentication) {

    }
])
