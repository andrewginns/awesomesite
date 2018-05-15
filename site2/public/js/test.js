"use strict";
addEventListener('load', start);
function start() { 
    console.log("scroll to top");
    //    document.getElementById("arrow").addEventListener("click", jumpTo.bind(null, "assessment_section"), false);
    //    document.getElementById("home").addEventListener("click", scrollTo.bind(null, 0,0), false);
    //    document.getElementById("blog").addEventListener("click", jumpTo.bind(null, "blog_section"), false);
    //    document.getElementById("projects").addEventListener("click", jumpTo.bind(null, "projects_section"), false);
    //    document.getElementById("about").addEventListener("click", jumpTo.bind(null, "about_section"), false);
    //    document.getElementById("contact").addEventListener("click", jumpTo.bind(null, "contact_section"), false);
    document.getElementById("arrow").addEventListener("click", smoothScroll.bind(null, "assessment_section"), false);
    document.getElementById("home").addEventListener("click", smoothScroll.bind(null, "hero_section"), false);
    document.getElementById("blog").addEventListener("click", smoothScroll.bind(null, "blog_section"), false);
    document.getElementById("projects").addEventListener("click", smoothScroll.bind(null, "projects_section"), false);
    document.getElementById("about").addEventListener("click", smoothScroll.bind(null, "about_section"), false);
    document.getElementById("contact").addEventListener("click", smoothScroll.bind(null, "contact_section"), false);
//    document.querySelector(".svg button pulse").getSVGDocument().getElementById("svgInternalID").setAttribute("fill", "red")
    console.log("listening for clicks")
} 

//function jumpTo(element, event) {
//    console.log(element);
//    console.log(event);
//    document.getElementById(element).scrollIntoView();
//    console.log("click");
//}

function currentYPosition() {
    // Firefox, Chrome, Opera, Safari
    if (self.pageYOffset) return self.pageYOffset;
    // Internet Explorer 6 - standards mode
    if (document.documentElement && document.documentElement.scrollTop)
        return document.documentElement.scrollTop;
    // Internet Explorer 6, 7 and 8
    if (document.body.scrollTop) return document.body.scrollTop;
    return 0;
}


function elmYPosition(eID) {
    var elm = document.getElementById(eID);
    var y = elm.offsetTop;
    var node = elm;
    while (node.offsetParent && node.offsetParent != document.body) {
        node = node.offsetParent;
        y += node.offsetTop;
    } return y*0.95;
}


function smoothScroll(eID) {
    var startY = currentYPosition();
    var stopY = elmYPosition(eID);
    var distance = stopY > startY ? stopY - startY : startY - stopY;
    if (distance < 100) {
        scrollTo(0, stopY); return;
    }
    var speed = Math.round(distance / 100);
    if (speed >= 20) speed = 20;
    var step = Math.round(distance / 25);
    var leapY = stopY > startY ? startY + step : startY - step;
    var timer = 0;
    if (stopY > startY) {
        for ( var i=startY; i<stopY; i+=step ) {
            setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
            leapY += step; if (leapY > stopY) leapY = stopY; timer++;
        } return;
    }
    for ( var i=startY; i>stopY; i-=step ) {
        setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
        leapY -= step; if (leapY < stopY) leapY = stopY; timer++;
    }
}





