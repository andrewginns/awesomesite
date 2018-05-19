"use strict";
addEventListener('load', start);
function start() { 
    ToggleScrollUp();

    $(window).scroll(function () {
        ToggleScrollUp();
    });
}

function ToggleScrollUp() {
    if ($("#insta_section").offset().top < $(window).scrollTop() + $(window).height()) {
        $('#scrollup').fadeIn();
    } else {
        $('#scrollup').fadeOut();
    }
}