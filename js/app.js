var app = angular.module("angtwit", ['ngSanitize','$strap.directives'] , function($routeProvider, $locationProvider) {

});

app.factory('ColumnData', function() {
    return {
        "columns" : [
            {
                "name" : "home",
                "type" : "friendTweets"
            },
            {
                "name" : "angularJS",
                "type" : "search"
            }
        ]
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


app.directive("loadtweets",function(){
    return {
        restrict:"E",
        template:"<p>Load More Tweets</p>",
        link: function( scope , element, attrs ) {
            element.addClass("loadmoretweets");
            element.bind("click", function(){
                scope.$apply("addMorePages()");
            })
        }
    }
});



app.directive( "tweetcolumn" , function ($compile) {
    var template_for = function(type) {
        return type+"\\.html";
    };
    return {
        restrict:"E",
        transclude: true,
        scope:true,
        compile: function(element, attrs) {
            return function(scope, element, attrs) {
                // Waits for Attibutes to be ready
                attrs.$observe('type', function(value) {
                    // Switch for Column Twitter Type
                    var tmpl;
                    switch (value)
                    {
                        case "friendTweets":
                            tmpl = template_for("friendtweets-column");
                            break;
                        case "search":
                            tmpl = template_for("search-column");
                            break;
                    }
                    // Switch for Column Type
                    element.html($("#"+tmpl).html());//.show();
                    $compile(element.contents())(scope);
                });
            };
        }
    }
})

function ColumnsCtrl ( $scope, ColumnData )
{
    $scope.ColumnData = ColumnData;
    $scope.test = function(){
        console.log("ohi");
    }
    //console.log(ColumnData.columns.length);
}



// Controller for any search collumns
function SeatchTweetsCtrl ( $scope , $http , ColumnData )
{
    $scope.data = ColumnData;
    // Limit for pagination
    $scope.pageSize = 20;
    $http.get('data/searchangularjs.json').success(function(data) {
        var results = data.query.results.results;
        $scope.tweets = results;
    });
    $scope.addMorePages = function() {
        console.log("addingMorePages");
        $scope.pageSize=$scope.pageSize+20
    }
    $scope.addHTML = function( st ){
        return addLinksToHtml(st);
    }
}

// Controller for 'Home Tweets' Column
function FriendTweetsCtrl( $scope , $http , ColumnData )
{
    $scope.data = ColumnData;
    $http.get('data/HomeTweets.json').success(function(data) {
        var results = data.query.results.statuses.status;
        $scope.tweets = results;
    });

    $scope.addHTML = function( st ){
        return addLinksToHtml(st);
    }
}

// Controller for Top Bar
// Used for holding user data
function TopBarCtrl (  $scope , $http , ColumnData )
{
    $scope.data = ColumnData;       //incase it needs it
    $http.get('data/userData.json').success(function(data) {
        var results = data.query.results
        $scope.userData = results;
        console.log(results);
    });
}

// Search More Tweets Controller
function TopSearchBarCtrl ($scope, $http)
{
    $scope.content;                         // Content
    $scope.searchDisabled = true;           // Toggle to disable button
    $scope.searchVars = {
       searchString : ""
    }
    // On Text Type
    $scope.change = function()
    {
        ($scope.searchVars.searchString.length > 2 ) ?  $scope.searchDisabled = false :  $scope.searchDisabled = true;
    }
    //Search Tweets
    $scope.searchTweets = function()
    {
        var searchString = encodeURI($scope.searchVars.searchString);
        var searchURL = "http://search.twitter.com/search.json?q="+searchString+"&rpp=5&include_entities=true&result_type=mixed"+"?callback=JSON_CALLBACK";
        $http.jsonp(searchURL).success(function(data) {
            var results = data.results;
            console.log(results);
            $scope.tweets = results;
        });
    }
    // Popover Content
    $scope.popover = {
        "content": "<div ng-repeat=\"tweet in tweets\" class=\"tweetBox\">\n    <div class=\"tweetprofilepic\">\n        <img ng-src=\"{{tweet.profile_image_url}}\">\n    </div>\n    <div class=\"tweetdetails\">\n        <p><a href=\"#\"><strong>{{tweet.from_user_name}}</strong><span class=\"screen_name\">@{{tweet.from_user}}</span></a></p>\n        <tweetbody ng-bind-html=\"addHTML(tweet.text)\">{{tweet.text}}</tweetbody>\n    </div>\n    <hr/>\n</div>"
    }
}

function addLinksToHtml( st ) {
    // Add Ancor to HTTP
    var regEx = /@([a-z0-9_]{1,20})/gi;
    var newString = st.replace(  regEx , "<a href='#'>@$1</a>" );

    // Adds Ancor to links
    var htmlRegEx = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    newString = newString.replace(  htmlRegEx , "<a href='$1'>$1</a>" );

    // Add HashTags
    return newString;
}

