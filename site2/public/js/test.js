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
    document.getElementById("arrow").addEventListener("click", smoothScroll.bind(null, "assessment_section"), false);
    document.getElementById("home").addEventListener("click", smoothScroll.bind(null, "hero_section"), false);
    document.getElementById("blog").addEventListener("click", smoothScroll.bind(null, "blog_section"), false);
    document.getElementById("projects").addEventListener("click", smoothScroll.bind(null, "projects_section"), false);
    document.getElementById("about").addEventListener("click", smoothScroll.bind(null, "about_section"), false);
    document.getElementById("contact").addEventListener("click", smoothScroll.bind(null, "contact_section"), false);
    //    document.querySelector(".svg button pulse").getSVGDocument().getElementById("svgInternalID").setAttribute("fill", "red")

    //    console.log("listening for clicks")
    document.getElementById("contact_submit").addEventListener("click", processForm);
    document.getElementById("more_blogs").addEventListener("click", retrieveBlogs);
    retrieveBlogs();
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

function processForm(e) {
    if (e.preventDefault) e.preventDefault();
    document.getElementById("contact_submit")
    var email_t = document.getElementById("contact_e_mail").value;
    var subject_t = document.getElementById("contact_subject").value;
    var message_t = document.getElementById("contact_message").value;
    var params = {email: email_t, subject: subject_t, message: message_t};
    var errMessage = validateFormData (params);
    if(errMessage.length === 0){
        redirectPost("", params)
    } else {
        alert(errMessage);
    }

    return false;
}

//used to validate the form input
//sends a message to the client if an error occurs
//return trues if validation passes, otherwise false
function validateFormData (params) {
    var errMessage = "";
    var err = trimParams(params);
    if(err) {
        return "Invalid Parameters - form fields must not be empty";
    }
    
    if(!validateEmail(params.email)) {
        return "Invalid Email Address";
    }
    return errMessage;
    
    //Used to trim the parameters
    //return false if any of the parameters are empty
    function trimParams(params) {
        params.email = params.email.trim();
        params.subject = params.subject.trim();
        params.message = params.message.trim();
        return params.email.length === 0 || params.subject.length === 0 || params.message.length === 0;
    }

    //Used to validate the email address, must contain an @ symbol and must be less than 255 characters
    function validateEmail(email) {
        return email.includes("@") && email.length <= 254;
    }
    
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

    var XHR = new XMLHttpRequest();

    // Define what happens on successful data submission
    XHR.addEventListener("load", function(event) {
        alert(event.target.responseText);
    });

    // Define what happens in case of error
    XHR.addEventListener("error", function(event) {
        alert('Oops! Something went wrong.');
    });

    // Bind the FormData object and the form element
    var FD = new FormData(form);
    // Set up our request
    XHR.open("POST", url);
    // The data sent is what the user provided in the form
    XHR.send(FD);

    //form.submit();
}

function retrieveBlogs() {
    var count = document.querySelectorAll("#blog_section > article").length;
    console.log(count);
    var XHR = new XMLHttpRequest();
    XHR.addEventListener("load", function(event) {
        var list = JSON.parse(this.responseText);
        console.log(list);
        var more = list.splice(-1,1)[0];
        console.log(more["more"]);
        if(!more["more"]) {
            document.getElementById("more_blogs").removeEventListener("click", retrieveBlogs);
            document.getElementById("more_blogs").className = "fadeout";
            document.getElementById("more_blogs").innerHTML = "No More.";  
        }
        
        document.querySelector("#blog_section > h2").insertAdjacentHTML("afterend", getBlogHTML(list));
    });
    
    // Define what happens in case of error
    XHR.addEventListener("error", function(event) {
        alert('Oops! Something went wrong.');
    });
    XHR.open("POST", "", true);
    //XHR.setRequestHeader("Content-type", "text/html");
    XHR.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    XHR.send("blogs=1&itemCount=" +count);
    // Define what happens on successful data submission
}



function getBlogHTML(rows) {
        
        var text = "";
        console.log("rows: ", rows);
        if(rows.length > 0) {
            for (let index in rows) {
                text += blogHtml(rows[index])+ "\n";
            }
        }
        return text;
        
        function blogHtml(row){
            var html = ["<article>", 
                    "<h3>"+ row.title +"</h3>",
                    "<p>"+ row.message + "</p>",
                    "</article>"].join("\n");
            return html;
            
        }
        
    }



function backToTop() {
    window.scrollTo(0,0);
}






