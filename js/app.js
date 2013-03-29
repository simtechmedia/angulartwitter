var app = angular.module("angtwit", ['ui','ngSanitize'] , function($routeProvider, $locationProvider) {


});


app.directive("tweet", function(){
    return {
        restrict:"E",
        template:"<div class=\"tweetprofilepic\">\n    <img src=\"{{tweet.user.profile_image_url}}\">\n</div>\n<div class=\"tweetdetails\">\n    <p>ScreenName : @{{tweet.user.screen_name}} </p>\n</div>\n\n<hr/>"
    }
});

function FriendTweetsCtrl($scope, $http)
{
    $http.get('data/HomeTweets.json').success(function(data) {
        var results = data.query.results.statuses.status;
        $scope.tweets = results;
        console.log(data);
    });
}