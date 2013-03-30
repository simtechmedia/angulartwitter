var app = angular.module("angtwit", ['ui','ngSanitize'] , function($routeProvider, $locationProvider) {


});


app.directive("tweet", function(){
    return {
        restrict:"E",
        controller: function ($scope) {
            this.sayHi = function() {
                console.log("Hello");
            }
        },
        template:"<div class=\"tweetprofilepic\">\n    <img ng-src=\"{{tweet.user.profile_image_url}}\">\n</div>\n<div class=\"tweetdetails\">\n    <p><a href=\"#\"><strong>{{tweet.user.name}}</strong><span class=\"screen_name\">@{{tweet.user.screen_name}}</span></a></p>\n    <tweetbody ng-bind-html=\"testFunc(tweet.text)\"></tweetbody>\n</div>\n<hr/>"
    }
});

app.directive("tweetbody", function(){
    return {
        restrict:"E",
        link: function( scope , element, attrs ) {
            //console.log(element[0].innerHTML);
        }
    }
});

function FriendTweetsCtrl( $scope , $http )
{
    $http.get('data/HomeTweets.json').success(function(data) {
        var results = data.query.results.statuses.status;
        $scope.tweets = results;
    });

    $scope.testFunc = function( st ){
        var regEx = new RegExp("@([a-z0-9_]{1,20})","g");
        var newString = st.replace(  regEx , "<a href='#'>@$1</a>" );
        return newString;
    }
}

