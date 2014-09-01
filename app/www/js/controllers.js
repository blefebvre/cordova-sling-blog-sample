angular.module('starter.controllers', [])

.controller('BlogCtrl', function($scope) {
})

.controller('AccountCtrl', function($scope, $http) {
    $scope.formData = {};

    $scope.processLogin = function() {
        $http.post('http://localhost:8080/content/espblog/posts.list.html/j_security_check', $scope.formData, {
            headers: {enctype:'multipart/form-data'}
        })
            .success(function(data) {
                console.log("success!!" + data);
            })
            .error(function(data, status) {
                console.error("error: " + data || "Request failed" );
            });
    };
});
