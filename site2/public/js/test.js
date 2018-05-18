"use strict";
addEventListener('load', start);
function start() { 
    console.log("scroll to top");

    console.log("scroll to top");
    window.onbeforeunload = backToTop;
    window.unload = backToTop;

    //    document.getElementById("arrow").addEventListener("click", jumpTo.bind(null, "assessment_section"), false);
    //    document.getElementById("home").addEventListener("click", scrollTo.bind(null, 0,0), false);
    //    document.getElementById("blog").addEventListener("click", jumpTo.bind(null, "blog_section"), false);
    //    document.getElementById("projects").addEventListener("click", jumpTo.bind(null, "projects_section"), false);
    //    document.getElementById("about").addEventListener("click", jumpTo.bind(null, "about_section"), false);
    //    document.getElementById("contact").addEventListener("click", jumpTo.bind(null, "contact_section"), false);

    //    document.getElementById("arrow").addEventListener("click", smoothScroll.bind(null, "assessment_section"), false);
    //    document.getElementById("home").addEventListener("click", smoothScroll.bind(null, "hero_section"), false);
    //    document.getElementById("blog").addEventListener("click", smoothScroll.bind(null, "blog_section"), false);
    //    document.getElementById("projects").addEventListener("click", smoothScroll.bind(null, "projects_section"), false);
    //    document.getElementById("about").addEventListener("click", smoothScroll.bind(null, "about_section"), false);
    //    document.getElementById("contact").addEventListener("click", smoothScroll.bind(null, "contact_section"), false);

    //    document.querySelector(".svg button pulse").getSVGDocument().getElementById("svgInternalID").setAttribute("fill", "red")

    //    console.log("listening for clicks")
    document.getElementById("contact_submit").addEventListener("click", processForm);
    //    console.log("listening for clicks")

    //    setTimeout(pollBar, 200)
} 

//function pollBar(){
//    var found = document.querySelector(".mfp-zoom-out-cur");
//    console.log(found);
//    //if the picture is present disable nav bar
//    if (found != null) {
//        document.getElementById("nav-bar").("display", "none");
//        console.log("hidden true");
//        //enable nav bar
//    } else {
//        document.getElementById("nav-bar").setAttribute("display", "none");
//        console.log("hidden false");
//    }
//    setTimeout(pollBar, 200);



//}

//function jumpTo(element, event) {
//    console.log(element);
//    console.log(event);
//    document.getElementById(element).scrollIntoView();
//    console.log("click");
//}

//function currentYPosition() {
//    // Firefox, Chrome, Opera, Safari
//    if (self.pageYOffset) return self.pageYOffset;
//    // Internet Explorer 6 - standards mode
//    if (document.documentElement && document.documentElement.scrollTop)
//        return document.documentElement.scrollTop;
//    // Internet Explorer 6, 7 and 8
//    if (document.body.scrollTop) return document.body.scrollTop;
//    return 0;
//}
//
//
//function elmYPosition(eID) {
//    var elm = document.getElementById(eID);
//    var y = elm.offsetTop;
//    var node = elm;
//    while (node.offsetParent && node.offsetParent != document.body) {
//        node = node.offsetParent;
//        y += node.offsetTop;
//    } return y*0.95;
//}
//
//
//function smoothScroll(eID) {
//    var startY = currentYPosition();
//    var stopY = elmYPosition(eID);
//    var distance = stopY > startY ? stopY - startY : startY - stopY;
//    if (distance < 100) {
//        scrollTo(0, stopY); return;
//    }
//    var speed = Math.round(distance / 100);
//    if (speed >= 20) speed = 20;
//    var step = Math.round(distance / 25);
//    var leapY = stopY > startY ? startY + step : startY - step;
//    var timer = 0;
//    if (stopY > startY) {
//        for ( var i=startY; i<stopY; i+=step ) {
//            setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
//            leapY += step; if (leapY > stopY) leapY = stopY; timer++;
//        } return;
//    }
//    for ( var i=startY; i>stopY; i-=step ) {
//        setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
//        leapY -= step; if (leapY < stopY) leapY = stopY; timer++;
//    }
//}

function processForm(e) {
    if (e.preventDefault) e.preventDefault();
    document.getElementById("contact_submit")
    var email_t = document.getElementById("contact_e_mail");
    var subject_t = document.getElementById("contact_subject");
    var message_t = document.getElementById("contact_message");

    if(email_t.value.trim() === "" || subject_t.value.trim() ==="" || message_t.value.trim() ==="") {
        var div = document.createElement('div');
        div.value = "Something wrong in the form";
        document.body.appendChild(div);

    } else {
        var data = {email: email_t.value, subject: subject_t.value, message: message_t.value};
        redirectPost("", data)
    }

    return false;
}

function redirectPost(url, data) {
    var form = document.createElement('form');
    document.body.appendChild(form);
    form.method = 'post';
    form.action = url;
    for (var name in data) {
        var input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = data[name];
        form.appendChild(input);
    }
    form.submit();
    window.href = "google.com"
}

function backToTop() {
    window.scrollTo(0,0);
}






