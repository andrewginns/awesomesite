"use strict";
addEventListener('load', start);
function start() { 
    console.log("scroll to top");

    window.onbeforeunload = backToTop;
    window.unload = backToTop;

    document.getElementById("more_blogs").addEventListener("click", retrieveBlogs);
    document.getElementById("more_projects").addEventListener("click", retrieveProjects);
    document.getElementById("contact_submit").addEventListener("click", processForm);

    retrieveBlogs();
    retrieveProjects();
}

function processForm(e) {
    if (e.preventDefault) e.preventDefault();
    document.getElementById("contact_submit")
    var email_t = document.getElementById("contact_e_mail").value;
    var subject_t = document.getElementById("contact_subject").value;
    var message_t = document.getElementById("contact_message").value;
    var mailList_t = document.querySelector('#contact_mail:checked').value? 1 : 0;
    console.log(mailList_t);
    var params = {email: email_t, mailList: mailList_t, subject: subject_t, message: message_t};
    console.log(params);
    var errMessage = validateFormData(params);
    if(errMessage.length === 0){
        redirectPost("", params)
    } else {
        reveal(errMessage);
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
        return "Empty Fields";
    }
<<<<<<< HEAD
    
    if (isNaN(params.mailList)) {
        return "Invalid Form";
    }
    
=======

>>>>>>> 5dd04ac1e950747f06a040711c32f9c4a28b3001
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
        reveal(event.target.responseText);
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
            document.getElementById("more_blogs").innerHTML = "no more";  
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
                    "<div id='spacer'></div>",
                    "</article>"].join("\n");
        return html;

    }

}

function retrieveProjects() {

    var count = document.querySelectorAll("#projects_section > article").length;
    console.log(count);
    var XHR = new XMLHttpRequest();
    XHR.addEventListener("load", function(event) {
        var list = JSON.parse(this.responseText);
        console.log(list);
        var more = list.splice(-1,1)[0];
        console.log(more["more"]);
        if(!more["more"]) {
            document.getElementById("more_projects").removeEventListener("click", retrieveProjects);
            document.getElementById("more_projects").className = "fadeout";
            document.getElementById("more_projects").innerHTML = "no more";  
        }

        document.querySelector("#projects_section > h2").insertAdjacentHTML("afterend", getProjectHTML(list));
    });

    // Define what happens in case of error
    XHR.addEventListener("error", function(event) {
        alert('Oops! Something went wrong.');
    });
    XHR.open("POST", "", true);
    //XHR.setRequestHeader("Content-type", "text/html");
    XHR.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    XHR.send("projects=1&itemCount=" +count);
    // Define what happens on successful data submission
}

function getProjectHTML(rows) {

    var text = "";
    console.log("rows: ", rows);
    if(rows.length > 0) {
        for (let index in rows) {
            text += projectHtml(rows[index])+ "\n";
        }
    }
    return text;

    function projectHtml(row){
        var html = ["<article>", 
                    "<h3>"+ row.title +"</h3>",
                    "<p>"+ row.message + "</p>",
                    "<div id='spacer'></div>",
                    "</article>"].join("\n");
        return html;

    }

}

function backToTop() {
    window.scrollTo(0,0);
}

function reveal(text) {
    console.log(text);
    document.querySelector('#slider').innerHTML = text;
    $('#slider').fadeIn();
    $('#slider').delay(1000).fadeOut();
}


