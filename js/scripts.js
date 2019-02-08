//Routing
///////////////////////////////////////////////////
var app = angular.module('myApp', ['ngRoute', 'myHttpService']);   
  
// configure the routes
app.config(function ($routeProvider) {
  $routeProvider
    .when('/', {
        // route for the home page 
        templateUrl: 'pages/home.html',
        controller: 'homeController'
    })
    .when('/student/:id', {
        // route for the students page
        templateUrl: 'pages/student.html',
        controller: 'studentController'
    })
    .when('/visualize/:id', {
        // route for the visualize page 
        templateUrl: 'pages/visualize.html',
        controller: 'visualizeController'
    })
    .when('/add', {
      // route for the add page 
      templateUrl: 'pages/add.html',
      controller: 'addController'
    })
    .when('/map', {
      // route for the add page 
      templateUrl: 'pages/map.html',
      controller: 'mapController'
    })
    .otherwise({
        // none of the above
        templateUrl: 'pages/error.html',
        controller: 'errorController'
    });
});
///////////////////////////////////////////////////

//Controllers
///////////////////////////////////////////////////
app.controller('homeController', 
  function ($scope, $rootScope, $http, studentDataService) {       

    
    //Get the initial data via $http or local storage
    if (window.localStorage.getItem("key") == null){
      //Get the data from the service
      studentDataService.then(function(data) {
        $scope.students = data;
        localStorage.setItem("key", JSON.stringify($scope.students));
        $scope.length = $scope.students.length;
      });

      //Originally, my $http service didn't work and I used the following instead
      /*
      $http.get("./json/students-data.json").success(function(response) {
        $scope.students = response;
        localStorage.setItem("key", JSON.stringify($scope.students));
        $scope.length = $scope.students.length;
      });
      */
    } else {
      $scope.students = JSON.parse(localStorage.getItem("key"));
      $scope.length = $scope.students.length;
    }
    

    // Update the total students in the view
    $scope.$watch('students', function() {
      $scope.length = $scope.students.length;
    }, true)

    // Remove an element based on the index passed in
    // Then save in the local storage
    $scope.removeStudent = function (index){
      if (confirm('Are you sure you want to delete this?')) {
        $scope.students.splice(index, 1);
        localStorage.setItem("key", JSON.stringify($scope.students));
      } else {
        // Do nothing
      }
    }

    $scope.sortStudents; 
    // Sort the student list order
    $scope.$watch('sortStudents', function() {
      if($scope.sortStudents == "alphabetical"){
        $scope.students.sort(function(a, b) {
          var x = a['name']; var y = b['name'];
          return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
        localStorage.setItem("key", JSON.stringify($scope.students));
      }
      if($scope.sortStudents == "school"){
        $scope.students.sort(function(a, b) {
          var x = a['school']; var y = b['school'];
          return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
        localStorage.setItem("key", JSON.stringify($scope.students));
      }
      if($scope.sortStudents == "grade"){
        $scope.students.sort(function(a, b) {
          var x = a['grade']; var y = b['grade'];
          return ((x-y < 0) ? -1 : ((x-y > 0) ? 1 : 0));
        });
        localStorage.setItem("key", JSON.stringify($scope.students));
      }
    }, true)

});

///////////////////////////////////////////////////
app.controller('studentController', 
  function ($scope, $rootScope, $routeParams) {
    $scope.students = JSON.parse(localStorage.getItem("key"));

    // Pass the index to the button in the view
    $scope.index = $routeParams.id;

    $scope.student = getStudent();

    //Get the specific student data
    function getStudent(){
      //Get the routing parameter
      let id = $routeParams.id;
      let student = $scope.students[id];

      //Return a copy instead of the actual object
      return Object.assign({}, student);
    }

    //Update an element in the data
    $scope.saveStudent = function(index){
      if (confirm('Are you sure you want to save this?')) {
        let target = $scope.students[index];
        Object.assign(target, $scope.student);
        localStorage.setItem("key", JSON.stringify($scope.students));
        alert("Saved Successfully!");
      } else {
          // Do nothing
      }
    }
});

///////////////////////////////////////////////////
app.controller('visualizeController', 
  function ($scope, $rootScope, $routeParams) {
    $scope.students = JSON.parse(localStorage.getItem("key"));

    // Create the elements to show student's basic data
    var GPAList = document.getElementById("profile");
    var item1 = document.createElement("p");
    item1.innerHTML = "<b>Name:</b><br>" + getStudent().name;
    var item2 = document.createElement("p");
    item2.innerHTML = "<b>Grade:</b><br>" + getStudent().grade;
    var item3 = document.createElement("p");
    item3.innerHTML = "<b>School:</b><br>" + getStudent().school;
    var item4 = document.createElement("p");
    item4.innerHTML = "<b>Interest:</b><br>" + getStudent().interest;
    GPAList.appendChild(item1);
    GPAList.appendChild(item2);
    GPAList.appendChild(item3);
    GPAList.appendChild(item4);
  
    //Get the specific student data
    function getStudent(){
      let id = $routeParams.id;
      let student = $scope.students[id];
      return student
    }

    //Get the data based on the routing parameter
    function getGPAAndExtracurricularHours(){
      let id = $routeParams.id;
      let studentData = $scope.students[id];
      return {'GPA9th': studentData['GPA9th'], 'GPA10th': studentData['GPA10th'], 
              'GPA11th': studentData['GPA11th'], 'GPA12th': studentData['GPA12th'],
              'volunteer': studentData['volunteer'], 'leadership': studentData['leadership'], 
              'activity': studentData['activity']}
    }
 
    startWorkers();

    // send messages to the Web Worker
    function startWorkers(e) {

      //Create a worker
      var myWorker = new Worker("./workers/visualize-worker.js");
      myWorker.onmessage = handleReceipt;

      //Send the JSON object to the worker for processing
      myWorker.postMessage(getGPAAndExtracurricularHours());
    }
   
    // Handle average gpa value received from the Web Worker
    function handleReceipt(event) {

      //Update the view when the values are set
      $scope.$apply(function(){
        $scope.GPA9th = event.data.GPA9th;
        $scope.GPA10th = event.data.GPA10th;
        $scope.GPA11th = event.data.GPA11th;
        $scope.GPA12th = event.data.GPA12th;
        $scope.averageGPA = event.data.averageGPA;
        $scope.volunteer = event.data.volunteer;
        $scope.leadership = event.data.leadership;
        $scope.activity = event.data.activity;
        $scope.totalHours = event.data.totalHours;
      });

        //Draw the pie chart
        draw();
    }

    //Draw the pie chart
    function draw() {
      // access the canvas element and its context
      var canvas = document.getElementById("testCanvas");
      var context = canvas.getContext("2d");
      
      var volunteerHours = $scope.volunteer;
      var leadershipHours = $scope.leadership;
      var activityHours = $scope.activity;
      var totalHours = $scope.totalHours;

      //Figure out the hours percentage of each activity 
      //and then draw the captions for the pie chart
      context.beginPath();
      context.font="14px Arial";
      context.fillStyle = "#48FF33";
      context.fillText("Volunteer Hours: " + volunteerHours + " (" + (volunteerHours/totalHours*100).toFixed(2) +")%",0,15);
      context.closePath();
      context.beginPath();
      context.fillStyle = "#FFC533";
      context.fillText("Leadership Hours: " + leadershipHours + " (" + (leadershipHours/totalHours*100).toFixed(2) +")%",0,30);
      context.closePath();
      context.beginPath();
      context.fillStyle = "#3379FF";
      context.fillText("Activity Hours: " + activityHours + " (" + (activityHours/totalHours*100).toFixed(2) + ")%",0,45);
      context.closePath();

      //Draw the pie chart based on the hours percentage of each activity
      //The three percentages will add up to 100%
      //The first piece of pie
      context.beginPath();
      context.lineWidth=140;
      context.strokeStyle="#48FF33";
      context.arc(200, 200, 70, (Math.PI/180)*0, 
                                (Math.PI/180)*360*volunteerHours/totalHours, false);
      context.stroke();
      context.closePath();
      
      //The second piece of pie
      context.beginPath();
      context.lineWidth=140;
      context.strokeStyle="#FFC533";
      context.arc(200, 200, 70, (Math.PI/180)*360*volunteerHours/totalHours, 
                                (Math.PI/180)*360*volunteerHours/totalHours + (Math.PI/180)*360*leadershipHours/totalHours, false);
      context.stroke();
      context.closePath();

      //The third piece of pie
      context.beginPath();
      context.lineWidth=140;
      context.strokeStyle="#3379FF";
      context.arc(200, 200, 70, (Math.PI/180)*360*volunteerHours/totalHours + (Math.PI/180)*360*leadershipHours/totalHours, 
                                (Math.PI/180)*360*volunteerHours/totalHours + (Math.PI/180)*360*leadershipHours/totalHours + (Math.PI/180)*360*activityHours/totalHours, false);
      context.stroke();
      context.closePath();
    }

});

///////////////////////////////////////////////////
app.controller('addController', 
  function ($scope, $rootScope, $routeParams) {
    $scope.students = JSON.parse(localStorage.getItem("key"));

    //Create a new student object that is going to be pushed into the student list
    function createStudentObject(){
      return {
        "name":  $scope.name,
        "grade": $scope.grade,
        "school": $scope.school,
        "interest": $scope.interest,
        "GPA9th": $scope.GPA9th,
        "GPA10th": $scope.GPA10th,
        "GPA11th": $scope.GPA11th,
        "GPA12th": $scope.GPA12th,
        "volunteer":  $scope.volunteer,
        "leadership": $scope.leadership,
        "activity": $scope.activity
      };
    }

    //Add a new student to the student list and then store it in the local storage.
    $scope.addStudent = function(){
      if (confirm('Are you sure you want to add this?')) {
        let newStudent = createStudentObject();
        $scope.students.push(newStudent);
        localStorage.setItem("key", JSON.stringify($scope.students));
        alert("Added Successfully!");
      } else {
          // Do nothing
      }
    }
});

///////////////////////////////////////////////////
app.controller('mapController', 
  function ($scope, $rootScope, $routeParams) {
    $scope.students = JSON.parse(localStorage.getItem("key"));

    //Create a script element to load the Google Map API
    var key = "AIzaSyCLqafABeFtyRZqYH5qKhppTv9e94LMydY";
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&callback=initialize`;
    document.body.appendChild(script);
    
    //Create an array that holds all the location data
    var locations = [
    ];
    
    createLocations();
    function createLocations(){
      //Use the geolocation to get the current position
      //Then push the current the location into the locations array 
      //that is going to be used to mark on the Google map
      navigator.geolocation.getCurrentPosition(function(position) {
        locations.push({name: 'Current Location', lat: position.coords.latitude, lng: position.coords.longitude});
      });

      //Examine the schools attended by students
      //and if there is a match, returns the coordinates.
      for(i=0; i<$scope.students.length; i++){
        switch($scope.students[i].school){
          case 'California High School':
                locations.push({name: 'California High School', lat: 37.747672, lng: -121.945591});
                break;
          case 'Dougherty Valley High School':
                locations.push({name: 'Dougherty Valley High School', lat: 37.769219, lng: -121.902325});
                break;
          case 'Monte Vista High School':
                locations.push({name: 'Monte Vista High School', lat: 37.843845, lng: -121.981749});
                break;
          case 'San Ramon Valley High School':
                locations.push({name: 'San Ramon Valley High School', lat: 37.824611, lng: -122.006355});
                break;
          default:
        }
      }

      //Load the map
      loadMap();
    }

    //Load the Google map
    function loadMap() {

      //Call the funciton later
      setTimeout(function() {

        // Customize the map
        $scope.mapOptions = {
          zoom: 10,
          center: new google.maps.LatLng(37.910076, -122.065186)
        };

        //Create the map
        $scope.map = new google.maps.Map(document.getElementById('map'), $scope.mapOptions);

        var marker;
        var i;
        var infowindow = new google.maps.InfoWindow();

        //Create multiple markers
        for (i = 0; i < locations.length; i++) {  
          marker = new google.maps.Marker({
            position: new google.maps.LatLng(locations[i]['lat'], locations[i]['lng']),
            map: $scope.map
          });
          
          //Create the event listeners that respond to the click event
          //and return the name of the clicked marker
          google.maps.event.addListener(marker, 'click', (function(marker, i) {
            return function() {
              infowindow.setContent(locations[i]['name']);
              infowindow.open(map, marker);
            }
          })(marker, i));
        }

      }, 5000);
    }
    
});

///////////////////////////////////////////////////
app.controller('errorController', 
  function ($scope, $location) {
    $scope.message = 'Path Error!';
    $scope.attemptedPath = $location.path();
});
