"use strict";
//used to run the javascript once the page is loaded
addEventListener('load', initNav);

var arrow;
var scrollup;
var home;
var blog;
var insta;
var projects;
var about;
var contact;
var menu;

//used to initialise variables and setup event listeners
function initNav() {
    arrow = document.getElementById("arrow");
    arrow.addEventListener("click", smoothScroll.bind(null, "assessment_section"), false);

    scrollup = document.getElementById("scrollup");
    scrollup.addEventListener("click", smoothScroll.bind(null, "assessment_section"), false);

    home = document.getElementById("home");
    home.addEventListener("click", smoothScroll.bind(null, "hero_section"), false);
    home.addEventListener("click", removeDropdown, false);

    blog = document.getElementById("blog");
    blog.addEventListener("click", smoothScroll.bind(null, "blog_section"), false);
    blog.addEventListener("click", dropdownNav, false);

    insta = document.getElementById("insta");
    insta.addEventListener("click", smoothScroll.bind(null, "insta_section"), false);
    insta.addEventListener("click", dropdownNav, false);

    projects = document.getElementById("projects");
    projects.addEventListener("click", smoothScroll.bind(null, "projects_section"), false);
    projects.addEventListener("click", dropdownNav, false);

    about = document.getElementById("about");
    about.addEventListener("click", smoothScroll.bind(null, "about_section"), false);
    about.addEventListener("click", dropdownNav, false);

    contact = document.getElementById("contact");
    contact.addEventListener("click", smoothScroll.bind(null, "contact_section"), false);
    contact.addEventListener("click", dropdownNav, false);

    menu = document.getElementById("menu");
    menu.addEventListener("click", dropdownNav, false);

    document.getElementById("scrollup").addEventListener("orientationchange", calcArrowHeight);
    calcArrowHeight();
    initScrollSVG();
}

//used to initialise the scrollup svg
function initScrollSVG() { 
    toggleScrollUp();
    window.addEventListener("scroll", toggleScrollUp);

    //used to toggle the scrollUp arrow
    function toggleScrollUp() {
        if ($("#insta_section").offset().top < $(window).scrollTop() + $(window).height()) {
            $('#scrollup').fadeIn();
        } else {
            $('#scrollup').fadeOut();
        }
    }
}

//used to offset the scroll up arrow by the footer height
function calcArrowHeight() {
    document.getElementById("scrollup").style.bottom = document.querySelector(".footer").offsetHeight;
}

//On click renames the class to append or remove 'dropdown'
function dropdownNav() {
    var x = document.getElementById("myTopnav");
    if (x.className === "topnav") {
        x.className += " dropdown";
    } else {
        x.className = "topnav";
    }
}

//On click renames the class to remove 'dropdown'
function removeDropdown() {
    var x = document.getElementById("myTopnav");
    x.className = "topnav";
}

//Get the y coordinates of the target
function targetPosition(target) {
    var elm = document.getElementById(target);
    var node = elm;
    var y = elm.offsetTop;

    //Add the offset until target is reached
    while (node.offsetParent && node.offsetParent != document.body) {
        node = node.offsetParent;
        y += node.offsetTop;
    } 

    return y*0.98;
}

//Get the current location on the page
function pageYLocation() {
    if (self.pageYOffset) return self.pageYOffset;

    //    Fallbacks for older browsers (e.g. IE)
    if (document.documentElement && document.documentElement.scrollTop)
        return document.documentElement.scrollTop;
    if (document.body.scrollTop) return document.body.scrollTop;

    return 0;
}

//Smooth scrolling based on distance to target from current location
//Adapted from http://www.itnewb.com/tutorial/Creating-the-Smooth-Scroll-Effect-with-JavaScript
function smoothScroll(target) {
    var startY = pageYLocation();
    var stopY = targetPosition(target);
    var dist = stopY > startY ? stopY - startY : startY - stopY;
    var speed = Math.round(dist / 100);
    var step = Math.round(dist / 25);
    var jump = stopY > startY ? startY + step : startY - step;
    var timer = 0;

    if (speed >= 20) speed = 20;

    //If the distance required is small jump
    if (dist < 100) {
        scrollTo(0, stopY); return;
    }

    //Otherwise dynamically calculate speed

    //Downwards scroll
    if (stopY > startY) {
        for ( var i=startY; i<stopY; i+=step ) {
            setTimeout("window.scrollTo(0, "+jump+")", timer * speed);
            jump += step; if (jump > stopY) jump = stopY; timer++;
        } return;
    }

    //Upwards scroll
    for ( var i=startY; i>stopY; i-=step ) {
        setTimeout("window.scrollTo(0, "+jump+")", timer * speed);
        jump -= step; if (jump < stopY) jump = stopY; timer++;
    }
}

