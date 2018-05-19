"use strict";
addEventListener('load', start);
function start() { 
    console.log("scroll to top");

    console.log("scroll to top");
    window.onbeforeunload = backToTop;
    window.unload = backToTop;

    document.getElementById("contact_submit").addEventListener("click", processForm);
    document.getElementById("more_blogs").addEventListener("click", retrieve);
    document.getElementById("contact_submit").addEventListener("click", reveal.bind(null, "hi"));
    retrieve();
} 


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
    document.getElementById("projects_section").innerHTML = XHR.responseText;

    //form.submit();
}


function retrieve() {
    var count = document.querySelectorAll("#blog_section > article").length;
    console.log(count);
    var XHR = new XMLHttpRequest();
    XHR.addEventListener("load", function(event) {
        document.querySelector("#blog_section > h2").insertAdjacentHTML("afterend", event.target.responseText);
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


function backToTop() {
    window.scrollTo(0,0);
}


//function reveal() {
//     document.getElementById("slider").classList.toggle("open");
//}

function reveal(text) {
    console.log(text);
    document.querySelector('#slider').innerHTML = text;
    $('#slider').fadeIn();
    $('#slider').delay(1000).fadeOut();
}


