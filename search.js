
var searchApp = angular.module('searchApp', ["ngRoute"]);

searchApp.config(function($routeProvider) {
    $routeProvider.
        when('/', {
            templateUrl: 'search.html',
            controller: 'searchCtrl'
        }).
        when('/:detailKey', {
            templateUrl: 'detail.html',
            controller: 'detailCtrl'
        }).
        otherwise({
            redirectTo: '/'
        });
});
searchApp.controller('searchCtrl', function ($scope, $http){
    $http.get('titles.json').success(function(data) {
        $scope.titles = data;
    });
    $scope.sortField = 'TitleNameSortable';
    $scope.reverse = true;
});

searchApp.controller('detailCtrl', function ($scope, $routeParams, $http){
    $http.get('titles.json').success(function(data) {
        $scope.title = data.filter(function(entry){
            return entry._id == $routeParams.detailKey;
        })[0];
    });
});