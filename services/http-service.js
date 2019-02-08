//Using the factory method to create a http service that gets the json data
angular.module("myHttpService",[])
.factory('studentDataService', function($http) {
    return $http.get("./json/students-data.json").then(function(response) {
        return response.data;
      });
});
