var app = angular.module("angtwit", ['ngSanitize','$strap.directives'] , function($routeProvider, $locationProvider) {

});

// Service to hold current table data, will extend this service to hold more complex data down the road
app.factory('ColumnData', function() {
    return {
        "columns" : [
            {
                "name" : "home",
                "type" : "friendTweets" ,
                "settings" : false
            },
            {
                "name" : "angularJS",
                "type" : "search" ,
                "settings" : true
            },
            {
                "name" : "@simtechmedia",
                "type" : "search" ,
                "settings" : false
            }
        ]
    }
});

// Tweet Body
app.directive("tweetbody", function(){
    return {
        restrict:"E",
        link: function( scope , element, attrs ) {
            //console.log(element[0].innerHTML);
        }
    }
});

// Load Tweets Directive
// Will make it so when you scroll to the bottom it automaticly loads tweets
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

// This directive sorts out the type of column it is and compiles it to stage
// Might figure out a better way to sort this out later
app.directive( "tweetcolumn" , function ($compile) {
    var template_for = function(type) {
        return type+"\\.html";
    };
    return {
        restrict:"E",
        transclude: true,
        scope:true,
        compile: function($scope, element, attrs) {
            return function(scope, element, attrs) {
                // Waits for Attibutes to be ready
                attrs.$observe('type', function(typeValue) {
                    attrs.$observe('name', function(colValue) {
                    // Switch for Column Twitter Type
                    var tmpl;
                    switch (typeValue)
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
                })});
            }
        }
    }
})

// For resizing the columsn to fit window height
app.directive('resize', function ($window) {
    return function (scope, element) {
        var w = angular.element($window);
        scope.getWindowDimensions = function () {
            return { 'h': w.height(), 'w': w.width() };
        };
        scope.$watch(scope.getWindowDimensions, function (newValue, oldValue) {
            scope.windowHeight = newValue.h;
            scope.style = function () {
                var newHeight = (scope.$parent.$parent.column.settings == true ? 240 :  130 );            // Find out if settings are closed or not
                return {
                    'height': (newValue.h - newHeight) + 'px'
                };
            };
        }, true);

        w.bind('resize', function () {
            scope.$apply();
        });
    }
})

// Edit Columns that sits right top of the columns
app.directive('editcol', function() {
    return {
        restrict:"A",
        link : function(scope , element) {

            var magicon = "<i class=\"icon-search icon-white heading-icon\" editcol></i>";
            var edit    = "<p class=\"heading-text\" editcol><a href=\"#\">Edit</a></p>";
            var close   = "<p class=\"heading-text\" editcol><a href=\"#\">Close</a></p>";

            if(true) openEditState();

            function openEditState(){
                element.children().replaceWith(close);
            }

            function closeEditState(){
                element.children().replaceWith(edit);
            }

            element.bind('mouseenter', function() {
                if(!scope.$parent.$parent.column.settings)
                    element.children().replaceWith(edit);
            })

            element.bind('mouseleave', function(){
                if(!scope.$parent.$parent.column.settings)
                    element.children().replaceWith(magicon);
            })
        }
    }
})

// searchsettings
// Settings that will be available for search-column type columns
app.directive('searchsettings', function(){
    return {
        restrict:"E",
        templateUrl:"search-settings.html",

        link: function(scope, element)
        {
            scope.getSettings = function (){
                return {
                     "settingsVal" : scope.showSettings
                };
            }
        }
    }
})

// Controller to share the column data to the repeater that creates the columns
// think i can get away with incorporating this to something else eventually, feel unnessary
function ColumnsCtrl ( $scope, ColumnData )
{
    $scope.ColumnData = ColumnData;
}

// Controller for any search collumns
function SeatchTweetsCtrl ( $scope , $http , ColumnData )
{
    $scope.data             = ColumnData;
    // Limit for pagination
    $scope.pageSize         = 10;
    $scope.searchString     = "";
    var searchString = encodeURI($scope.$parent.column.name);
    var searchURL = "http://search.twitter.com/search.json?q="+searchString+"&rpp=20&include_entities=true&result_type=mixed"+"?callback=JSON_CALLBACK";
    $http.jsonp(searchURL).success(function(data) {
        var results = data.results;
        //console.log(results);
        $scope.tweets = results;
    });

    /*
    $http.get('data/searchangularjs.json').success(function(data) {
        var results = data.query.results.results;
        $scope.tweets = results;

    });*/
    $scope.addMorePages = function() {
        console.log("addingMorePages");
        $scope.pageSize=$scope.pageSize+10
    }
    $scope.addHTML = function( st ){
        return addLinksToHtml(st);
    }
}

// Controller for searchColumn
function searchSettingsCtrl ( $scope , ColumnData)
{
    $scope.data             = ColumnData;
    $scope.currentVO        = $scope.$parent.$parent.$parent.column;        // Oh this nasty.
    $scope.searchDisabled   = true;
    $scope.showSettings     = {
        show :             $scope.currentVO.settings
    };

    $scope.searchVars       = {
        searchString :  $scope.currentVO.name
    }
    // On Text Type
    $scope.change = function()
    {
        // &&  $scope.searchVars.searchString !=  $scope.currentVO.name
        // Gotta sort out why this isn't working
        if ($scope.searchVars.searchString.length > 2 ) {
           $scope.searchDisabled = false
        } else {
            $scope.searchDisabled = true;
        }
    }

    // Toggle Settings Panel
    $scope.toggleSettingsPanel = function()
    {
        console.log("toggleSettingsPanel");
        ($scope.currentVO.settings == true ) ? $scope.closeSettingsPanel() : $scope.openSettingsPanel() ;
    }

    // Close Settings Panel
    $scope.closeSettingsPanel = function()
    {
        $scope.currentVO.settings   = $scope.showSettings.show = false;
    }

    // Open Settings Panel
    $scope.openSettingsPanel = function(){
        $scope.currentVO.settings = $scope.showSettings.show  = true;
    }

    // Asign New String to Data VO that holds the column data
    $scope.changeSearch = function ()
    {
        $scope.currentVO.name       = $scope.searchVars.searchString;
        $scope.closeSettingsPanel();
    }

    // Delete column from object
    $scope.deleteColumn = function ()
    {
        // Underscore.js function
        $scope.data.columns = _($scope.data.columns).reject(function(el) {  return el.name === $scope.currentVO.name ; });
    }
}

// Controller for 'Home Tweets' Column
function FriendTweetsCtrl( $scope , $http , ColumnData )
{
    var homelineURL = "https://query.yahooapis.com/v1/public/yql?q=set%20oauth_token%3D'109847094-V2IhnURLzb4q9bpvbMAuvulrNywM4EvSvmjsILvV'%20on%20twitter%3B%0Aset%20oauth_token_secret%3D'5W73pwttktohZ55YOFC7Tjl9YQeelyQ6bfDrDDsZLc'%20on%20twitter%3B%0Aselect%20*%20from%20twitter.status.timeline.friends%3B&format=json&diagnostics=true&env=store%3A%2F%2Fsimtechmedia.com%2Foauthdemo&callback=JSON_CALLBACK"

    $http.jsonp(homelineURL).success(function(data)
    {
        var results = data.query.results.statuses.status;
        $scope.tweets = results;
    })

    $scope.addHTML = function( st ){
        return addLinksToHtml(st);
    }
}

// Controller for Top Bar
// Used for holding user data
function TopBarCtrl (  $scope , $http , ColumnData )
{


    $http.get('data/userData.json').success(function(data) {
        var results = data.query.results
        $scope.userData = results;
        //console.log(results);
    });
}

// Search More Tweets Controller
function TopSearchBarCtrl ($scope, ColumnData,  $http)
{
    $scope.ColumnData       = ColumnData
    $scope.content;                         // Content
    $scope.searchDisabled   = true;         // Toggle to disable button
    $scope.searchVars       = {
        searchString : ""
    }
    // On Text Type
    $scope.change = function() {
        ($scope.searchVars.searchString.length > 2 ) ?  $scope.searchDisabled = false :  $scope.searchDisabled = true;
    }
    //Search Tweets
    $scope.searchTweets = function()
    {
        $scope.ColumnData.columns.push({
            "name" : $scope.searchVars.searchString ,
            "type" : "search",
            "settings" : false
        });

        /*
        var searchString = encodeURI($scope.searchVars.searchString);
        var searchURL = "http://search.twitter.com/search.json?q="+searchString+"&rpp=5&include_entities=true&result_type=mixed"+"?callback=JSON_CALLBACK";
        $http.jsonp(searchURL).success(function(data) {
            var results = data.results;
            console.log(results);
            $scope.tweets = results;
        });
        */
    }
    // Popover Content
    // Commenting out , might use it later
    /*
    $scope.popover = {
        "content": "<div ng-repeat=\"tweet in tweets\" class=\"tweetBox\">\n    <div class=\"tweetprofilepic\">\n        <img ng-src=\"{{tweet.profile_image_url}}\">\n    </div>\n    <div class=\"tweetdetails\">\n        <p><a href=\"#\"><strong>{{tweet.from_user_name}}</strong><span class=\"screen_name\">@{{tweet.from_user}}</span></a></p>\n        <tweetbody ng-bind-html=\"addHTML(tweet.text)\">{{tweet.text}}</tweetbody>\n    </div>\n    <hr/>\n</div>"
    }
    */

}


function MyModalCtrl ( $scope )
{
    //console.log("MyModalCtrl");
    //zconsole.log($scope);
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

