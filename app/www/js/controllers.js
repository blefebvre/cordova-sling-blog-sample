angular.module('starter.controllers', ['starter.services'])

.controller('BlogCtrl', function($scope) {
})

.controller('AccountCtrl', ['$scope', '$http', 'formDataObject', 
    function($scope, $http, formDataObject) {
        $scope.formData = {
            _charset_: "UTF-8",
            selectedAuthType: "form",
            resource: "/",
            j_username: "",
            j_password: "",
            j_validate: "true"
        };

        $scope.processLogin = function() {
            $http({
                    method: 'POST',
                    url: 'http://localhost:8080/j_security_check', 
                    data: $scope.formData,
                    headers: {
                        'Content-Type': undefined
                    },
                    transformRequest: formDataObject
                })
                .success(function(data, status) {
                    if (status == 200) {
                        console.log("Login SUCCESS!");
                    } else {
                        console.log("Interesting status: " + status);
                    }
                })
                .error(function(data, status) {
                    console.error("Login failed");
                    console.error("Status: " + status + ", Message: " + data);
                });
        };
    }
]);
