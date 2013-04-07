$(document).ready(function () {
    var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    var isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);

    // Pretty up Scrollbars for non-chromers
    if( ! isChrome && ! isSafari )
    {
        //$('.colTweets').jScrollPane();
    }

});



