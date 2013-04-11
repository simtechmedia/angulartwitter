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
            },
            {
                "name" : "simtechmedia",
                "type" : "user" ,
                "settings" : false
            }

        ]
    }
});

// Tweet Body
app.directive("tweetbody", function($compile){
    return {
        restrict:"E",
        replace: true,
        compile: function(tElement, tAttrs, transclude) {
//          tElement.html(tweetbodyTemplate);
            return function ( scope, element , attrs) {
                attrs.$observe('text', function(textValue) {
                    if(textValue != undefined && textValue.length > 0) {
                        var bodyText = addLinksToHtml(textValue);
                        element.html( $compile(  "<p>"+bodyText+"</p>" )(scope) )
                    }
                })
            }
        }
    }
});

// Directive for profile links inside tweets, not currently enabled
// As the Modal for Angular Strap doesn't want to seem to work with the way i've set it up
app.directive("profilelink", function($compile){
    return {
        restrict:"E",
        replace:true,
        compile: function() {
            return function ( scope, element , attrs) {
                attrs.$observe('profilename', function(textValue) {
                    var linkHTML = '<a href="#" ng-controller="MyModalCtrl" ng-click="openModal()" bs-modal="partials/user-modal.html" data-toggle="modal">@'+textValue+'</a>'
                    element.html( $compile( linkHTML )(scope) );
                });
            }
        }
    }
})

// Directives for Hash links inside tweets
app.directive("hashlink", function($compile){
    return {
        restrict:"E",
        replace:true,
        compile: function() {
            return function ( scope, element , attrs) {
                attrs.$observe('hash', function(textValue) {
                    var linkHTML = '<a href="#" ng-controller="HashTagSearchCtrl" ng-click="searchTweets(\''+textValue+'\')"><strong>#'+textValue+'</strong></a>';
                    element.html( $compile( linkHTML )(scope) );
                });
            }
        }
    }
});

// Load Tweets Directive
// Will make it so when you scroll to the bottom it automaticly loads tweets
// and also this doesn't need to be a directive
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
        replace:true,
        compile: function() {
            // Link Function
            return function(scope, element, attrs) {
                // Waits for Attibutes to be ready
                attrs.$observe('type', function(typeValue) {
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
                        case "user":
                            tmpl = template_for("user-column");
                            break;

                    }
                    // Switch for Column Type
                    // This is what's stopping me from getting everything
                    // Into partials. html() doesn't seem to work on external files?
                    element.html($("#"+tmpl).html());//.show();
                    $compile(element.contents())(scope);
               });
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
            var originalElement = element.children();
            var magicon = "<i class=\"icon-search icon-white heading-icon\" editcol></i>";
            var edit    = "<p class=\"heading-text\" editcol><a href=\"#\">Edit</a></p>";
            var close   = "<p class=\"heading-text\" editcol><a href=\"#\">Close</a></p>";
            if(scope.showSettings.show == true) openEditState();
            scope.getShowSettings = function () {
                return { show : scope.showSettings.show }
            };

            scope.$watch(scope.getShowSettings, function (newValue, oldValue)
            {
                if( newValue.show == true )
                    openEditState();
                else
                    closeEditState();
            }, true);

            function openEditState(){
                element.children().replaceWith(close);
            }

            function closeEditState(){
               //element.children().replaceWith(magicon);
               element.children().replaceWith(originalElement);
            }

            /*
            this break things, will try to redo later
            thikn it's something to do with bubbling, but the other binds are in the controller
            element.bind('mouseenter', function() {
                if(!scope.$parent.$parent.column.settings)
                    element.children().replaceWith(edit);
            })

            element.bind('mouseleave', function(){
                if(!scope.$parent.$parent.column.settings)
                    element.children().replaceWith(magicon);
            })

            */
        }
    }
})

// searchsettings
// Settings that will be available for search-column type columns
app.directive('searchsettings', function(){
    return {
        restrict:"E",
        templateUrl:"partials/search-settings.html",
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

app.directive('usersettings', function(){
    return {
        restrict:"E",
        templateUrl:"partials/user-settings.html",
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

app.directive('homesettings', function(){
    return {
        restrict:"E",
        templateUrl:"partials/home-settings.html",

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


// For some odd reason the 'client' information on certain tweets comes in as encoded HTML
// This directive sorts it out
// TODO change this to a link function not compile
app.directive("twitterclient", function($compile){
    return {
        restrict:"E",
        replace:true,
        compile: function() {
            return function ( scope, element , attrs) {
                attrs.$observe('client', function(textValue) {
                    var decode = decodeXml( textValue );
                    var linkHTML = "<p>Client : "+decode+"</p>";
                    element.html( $compile( linkHTML )(scope) );
                });
            }
        }
    }
});



// Tweet time, converts twitter time to human time
// Need to change compile to linker function i think
// It's 2am and i need togot sleep
app.directive("tweettime", function($compile){
    return {
        restrict:"E",
        replace:true,
        compile: function() {
            return function ( scope, element , attrs) {
                attrs.$observe('time', function(textValue) {
                    //console.log(scope);
                    var linkHTML = '<p>'+TwitterDateConverter(textValue)+'</p>';
                    element.html( $compile( linkHTML )(scope) );
                });
            }
        }
    }
});

// More Tweet Details directive
app.directive("tweetmoredetails", function()
{
   return {
       replace:true,
       template: '',
       link: function( scope, element) {
           element.bind('click', function(){
               scope.tweetmoredetails( scope.tweet );
           })
       }
   }
});

// DIrective that controls the slie motion when tweetmoredetails is clicked
app.directive("colsider", function()
{
    return function (scope, element) {

        scope.getMoreDetailState = function ()
        {
            return { state : scope.moreDetails.state }
        }

        // Watches when slide needs to be abled
        scope.$watch(scope.getMoreDetailState, function (newValue, oldValue)
        {
            if( newValue.state === true )
            {

                if(element.hasClass("coLRightState")) {
                    element.removeClass("coLRightState");
                }
                element.addClass("colLeftState");
            }

            if( newValue.state === false )
            {
                if(element.hasClass("colLeftState")){
                    element.removeClass("colLeftState");
                }
                element.addClass("coLRightState");
            }
        }, true);
    }
});

//scrolleey
// Directive that will move the scrollbar up and down when the more tweet details are pressed
app.directive("scrolleey", function()
{
    return function (scope, element, attrs)
    {
        var savedY = 0 ;                                    // Saves the yPositon before moretweetdetails is used

        scope.getMoreDetailState = function ()
        {
            return { state : scope.moreDetails.state }
        }

        // Watches when slide needs to be abled
        scope.$watch(scope.getMoreDetailState, function (newValue, oldValue)
        {
            if( newValue.state === true ) {

                // TODO not sure why this doens't work
                savedY = attrs.$$element[0].scrollTop;      // Save Current YPos so we can return
                attrs.$$element[0].scrollTop = 0

                if(element.hasClass("colYScrollY")) element.removeClass("colYScrollY");         // Turns off Y Scrolling
                element.addClass("colYScrollN");
            }

            if( newValue.state === false ) {

                attrs.$$element[0].scrollTop = savedY;

                if(element.hasClass("colYScrollN")) element.removeClass("colYScrollN");
                element.addClass("colYScrollY");
            }
        }, true);
    }
});

// Controller to share the column data to the repeater that creates the columns
// think i can get away with incorporating this to something else eventually, feel unnessary
function ColumnsCtrl ( $scope, ColumnData )
{
    $scope.ColumnData = ColumnData;
}

// Parent Controller for all columns
// Contains functions that all columsn use
function TweetColumnCtrl ( $scope, ColumnData )
{
    $scope.data             = ColumnData;       // Modal service to hold info of state of the columns
    $scope.moreDetails =
    {
        state : false,                          // State of the more details , if the column is slid left or not
        tweet : ""
    }
    // More Tweet Details Button
    $scope.tweetmoredetails = function( tweet )
    {
        $scope.moreDetails.tweet = tweet;
        $scope.moreDetails.state = true;
        $scope.safeApply();
    }
    // Less Tweet Details when back is pressed
    $scope.tweetlessdetails = function()
    {
        $scope.moreDetails.state = false;
        $scope.safeApply();
    }
    // Safely Apply
    // Thanks to Alex Vanston https://coderwall.com/p/ngisma
    $scope.safeApply = function(fn) {
        var phase = this.$root.$$phase;
        if(phase == '$apply' || phase == '$digest') {
            if(fn && (typeof(fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };
}

// Controller for any search collumns
function SearchTweetsCtrl ( $scope , $http  )
{
    $scope.pageSize         = 10;               // Limit for pagination
    $scope.searchString     = "";
    var searchString        = encodeURI($scope.$parent.column.name);
    var searchURL           = "http://search.twitter.com/search.json?q="+searchString+"&rpp=20&include_entities=true&result_type=mixed"+"?callback=JSON_CALLBACK";

    // Debug stuff, getting rate limited
    if(document.URL.substring(0,16) == "http://localhost")
    {
        $http.get('data/searchangularjs.json').success(function(data) {
            $scope.processData(data);
        });
    } else {
        $http.jsonp(searchURL).success(function(data)
        {
            $scope.processData(data);
        })
    }

    $scope.processData = function(data)
    {
        var results = data.results;
        $scope.tweets = results;
    }

    $scope.addMorePages = function() {
        console.log("addingMorePages");
        $scope.pageSize=$scope.pageSize+10
    }
}

// User Tweets Controller
// This is the tweets for a particular user
function UserTweetsCtrl ( $scope , $http )
{
    // Limit for pagination
    $scope.pageSize         = 10;
    $scope.searchString     = "";
    var searchString        = encodeURI($scope.$parent.column.name);
    var searchURL           = "https://query.yahooapis.com/v1/public/yql?q=set%20access_token%3D'109847094-V2IhnURLzb4q9bpvbMAuvulrNywM4EvSvmjsILvV'%20on%20twitter%3B%0Aset%20access_token_secret%3D'5W73pwttktohZ55YOFC7Tjl9YQeelyQ6bfDrDDsZLc'%20on%20twitter%3B%0Aselect%20*%20FROM%20twitter.statuses.user_timeline%20%0AWHERE%20screen_name%3D%22simtechmedia%22&format=json&env=store%3A%2F%2Fsimtechmedia.com%2Fangtwit01&callback=JSON_CALLBACK";

    // Debug stuff, getting rate limited
    if(!document.URL.substring(0,16) == "http://localhost")
    {
        $http.get('data/userTweets.json').success(function(data) {

            $scope.processData(data);
        });
    } else {
        $http.jsonp(searchURL).success(function(data)
        {
            $scope.processData(data);
        })
    }

    $scope.processData = function(data)
    {
        var results = JSON.parse(data.query.results.result);
        $scope.tweets = results;
    }

    $scope.parseTwitterTime = function( time )
    {
        return parseTwitterDate(time);
    }

    $scope.addMorePages = function() {
        console.log("addingMorePages");
        $scope.pageSize=$scope.pageSize+10
    }
}


// Controller for searchColumn
function searchSettingsCtrl ( $scope )
{
    $scope.currentVO        = $scope.$parent.$parent.$parent.column;        // Oh this nasty.
    $scope.searchDisabled   = true;
    $scope.thisIndex;
    $scope.leftdisabled      = false;
    $scope.rightdisabled     = false ;

    $scope.showSettings     = {
        show :             $scope.currentVO.settings
    };

    $scope.searchVars       = {
        searchString :  $scope.currentVO.name
    }

    // Checks if arrowsm are valid
    $scope.checkArrows      = function ()
    {
        $scope.leftdisabled = ( $scope.thisIndex > 0 ) ?   false :  true ;
        $scope.rightdisabled    = ( $scope.thisIndex < $scope.data.columns.length -1 ) ?   false :  true ;
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
        ($scope.currentVO.settings == true ) ? $scope.closeSettingsPanel() : $scope.openSettingsPanel() ;
    }

    // Close Settings Panel
    $scope.closeSettingsPanel = function()
    {
        $scope.currentVO.settings   = $scope.showSettings.show = false;
    }

    // Open Settings Panel
    $scope.openSettingsPanel = function(){
        $scope.thisIndex            = $scope.$parent.$index
        $scope.currentVO.settings = $scope.showSettings.show  = true;
        $scope.checkArrows();
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
        $scope.ColumnData.columns = _($scope.ColumnData.columns).reject(function(el) {
            return el.name === $scope.currentVO.name && el.type == $scope.currentVO.type ;
        });
    }

    // Arrow Arrange Functions
    $scope.moveColLeft = function()
    {
        $scope.thisIndex = $scope.$parent.$index;
        if( $scope.thisIndex  > 0 )  {
            swapArrayElements($scope.ColumnData.columns, $scope.thisIndex , $scope.thisIndex  - 1 )
            $scope.thisIndex-- ;
            $scope.checkArrows();
        }
    }

    $scope.moveColRight = function()
    {
        $scope.thisIndex = $scope.$parent.$index
        if( $scope.thisIndex  < $scope.data.columns.length -1  )
        {
            swapArrayElements($scope.data.columns, $scope.thisIndex , $scope.thisIndex  + 1 )
            $scope.thisIndex++;
            $scope.checkArrows();
        }
    }
}

// Controller for 'Home Tweets' Column
function FriendTweetsCtrl( $scope , $http  )
{
    // Query for Home Timeline tweets
    // TODO I still gotta figure how to get friends retreets as well as friends tweets
    var homelineURL = "https://query.yahooapis.com/v1/public/yql?q=set%20oauth_token%3D'109847094-V2IhnURLzb4q9bpvbMAuvulrNywM4EvSvmjsILvV'%20on%20twitter%3B%0Aset%20oauth_token_secret%3D'5W73pwttktohZ55YOFC7Tjl9YQeelyQ6bfDrDDsZLc'%20on%20twitter%3B%0Aselect%20*%20from%20twitter.status.timeline.friends%3B&format=json&diagnostics=true&env=store%3A%2F%2Fsimtechmedia.com%2Foauthdemo&callback=JSON_CALLBACK";

    // Debug stuff, getting rate limited
    if(document.URL.substring(0,16) == "http://localhost")
    {
        $http.get('data/HomeTweets.json').success(function(data) {
            $scope.processData(data);
        });
    } else {
        $http.jsonp(homelineURL).success(function(data)
        {
            $scope.processData(data);
        })
    }

    // Process JSON data and push it to the view
    $scope.processData = function(data)
    {
        var results = data.query.results.statuses.status;
        $scope.tweets = results;
    }
}

// Controller for Top Bar
// Used for holding user data, at the moment its loading in a set JSON
// But eventually I'll properly do a OAuth thing
function TopBarCtrl (  $scope , $http )
{
    $http.get('data/userData.json').success(function(data) {
        var results = data.query.results
        $scope.userData = results;
        //console.log(results);
    });
}

// Search More Tweets Controller
function TopSearchBarCtrl ($scope, ColumnData )
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
    $scope.searchTweets = function()  {
        $scope.ColumnData.columns.push({
            "name" : $scope.searchVars.searchString ,
            "type" : "search",
            "settings" : false
        });
    }
}

// Controller for all the hash tags, going to figure out a way
// So one controller does the whole tweet rather than individual elements
function HashTagSearchCtrl ( $scope )
{
    $scope.content;                         // Content
    $scope.searchVars       = {
        searchString : ""
    }
    //Search Tweets
    $scope.searchTweets     = function(st)
    {
        $scope.ColumnData.columns.push({
            "name"          : st ,
            "type"          : "search",
            "settings"      : false
        });
    }
}

// Controller for Profile Modal
// Uses jsonp call to grab data from ypl
function ProfileModalCtrl ( $scope, $http  )
{
   // var id = $scope.$parent.tweet.user.id;
    $scope.sourceTweet      = $scope.$parent.tweet ;

    var id;
    var screen_name;
    if($scope.$parent.tweet.from_user_id != undefined) {
        id                  = $scope.$parent.tweet.from_user_id;
        screen_name         = $scope.$parent.from_user
    } else {
        id                  = $scope.$parent.tweet.user.id;
        screen_name         = $scope.$parent.tweet.user.screen_name;
    }

    $scope.urlRequest = "https://query.yahooapis.com/v1/public/yql?q=set%20oauth_token%3D'109847094-V2IhnURLzb4q9bpvbMAuvulrNywM4EvSvmjsILvV'%20on%20twitter%3B%0Aset%20oauth_token_secret%3D'5W73pwttktohZ55YOFC7Tjl9YQeelyQ6bfDrDDsZLc'%20on%20twitter%3B%0Aselect%20*%20from%20twitter.users%20where%20id%3D"+id+"%3B%20&format=json&env=store%3A%2F%2Fsimtechmedia.com%2Foauthdemo&callback=JSON_CALLBACK";
    $scope.openModal = function(){
        if(document.URL.substring(0,16) == "http://localhost") {
            $scope.getLocalProfile();
        } else {
            $scope.getRealProfile();
        }
    }

    $scope.getLocalProfile = function()
    {
        $http.get('data/userProfile.json').success(function(data) {
            var results = data.query.results;
            //console.log(results);
            $scope.user = results.user;;
        });
    }

    $scope.getRealProfile = function()
    {
        $http.jsonp($scope.urlRequest).success(function(data){
            // Check if we're being data limited
            var results = data.query.results;
            if(results != null)
            {
                $scope.user = results.user;;
            } else {
                console.log("API Data capped")
                // We're being API capped =/
                $scope.getLocalProfile();
                //$scope.user = results.user;
            }
        });
    }

    $scope.userTweets = function()
    {
        $scope.ColumnData.columns.push({
            "name" : screen_name ,
            "type" : "user",
            "settings" : false
        });
    }

    $scope.userMentions = function()
    {
        $scope.ColumnData.columns.push({
            "name" : "@"+screen_name ,
            "type" : "search",
            "settings" : false
        });
    }
}

// JavaScript Helper Functions
function addLinksToHtml( st )
{
    // Add Ancor to @
    var regEx = /@([a-z0-9_]{1,20})/gi;
    // Commenting this out until i figure out the bug
    // TODO this breaks the modal , I've asked the dude who made the plugin for hlep, we'll get back to it
    var newString = st;// = String(st).replace(  regEx , "<profilelink profilename='$1'></profilelink>" );

    // Adds Ancor to links
    var htmlRegEx = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    newString = String(newString).replace(  htmlRegEx , "<a href='$1' target='_blank'><strong>$1</strong></a>" );

    //console.log("newString = "  + newString);
    // Add HashTags
    var hashRegEx = /#([a-z0-9_]{1,20})/gi;
    newString = String(newString).replace(  hashRegEx , "<hashlink hash='$1'></hashlink>" );

    return newString;
}

function swapArrayElements(array_object, index_a, index_b)
{
    var temp = array_object[index_a];
    array_object[index_a] = array_object[index_b];
    array_object[index_b] = temp;
}

function TwitterDateConverter(time){
    var date = new Date(time),
        diff = (((new Date()).getTime() - date.getTime()) / 1000),
        day_diff = Math.floor(diff / 86400);

    if ( isNaN(day_diff) || day_diff < 0 || day_diff >= 31 )
        return;

    return day_diff == 0 && (
        diff < 60 && "just now" ||
            diff < 120 && "1 minute ago" ||
            diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
            diff < 7200 && "1 hour ago" ||
            diff < 86400 && Math.floor( diff / 3600 ) + " hours ago") ||
        day_diff == 1 && "Yesterday" ||
        day_diff < 7 && day_diff + " days ago" ||
        day_diff < 31 && Math.ceil( day_diff / 7 ) + " weeks ago";
}



var xml_special_to_escaped_one_map = {
    '&': '&amp;',
    '"': '&quot;',
    '\'': '&#039;',
    '<': '&lt;',
    '>': '&gt;'
};

var escaped_one_to_xml_special_map = {
    '&amp;': '&',
    '&quot;': '"',
    '&#039;': '\'',
    '&lt;': '<',
    '&gt;': '>'
};

function encodeXml(string) {
    return string.replace(/([\&"'<>])/g, function(str, item) {
        return xml_special_to_escaped_one_map[item];
    });
};

function decodeXml(string) {
    return string.replace(/(&amp;|&quot;|&#039;|&lt;|&gt;)/g,
        function(str, item) {
            return escaped_one_to_xml_special_map[item];
        });
}