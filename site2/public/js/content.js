"use strict";

//used to run the javascript once the page is loaded
addEventListener('load', initContent);

var projectsLoader;
var blogsLoader;
var blogsBtn;
var projectsBtn;
var submitBtn;
var submitLoader;

//used to initialise variables and setup event listeners
function initContent() { 
    console.log("scroll to top");

    window.onbeforeunload = backToTop;
    window.unload = backToTop;

    blogsBtn = document.getElementById("more_blogs");
    blogsBtn.addEventListener("click", retrieveBlogs);
    blogsLoader = document.getElementById("blogs_loader");
    blogsBtn.showLoader = showLoader.bind(null, blogsLoader);

    projectsBtn = document.getElementById("more_projects");
    projectsBtn.addEventListener("click", retrieveProjects);
    projectsLoader = document.getElementById("projects_loader");
    projectsBtn.showLoader = showLoader.bind(null, projectsLoader);

    submitBtn = document.getElementById("contact_submit");
    submitBtn.addEventListener("click", processForm);
    submitLoader = document.getElementById("form_loader");
    submitBtn.showLoader = showLoader.bind(null, submitLoader);

    retrieveBlogs();
    retrieveProjects();
}

//used to scroll the page back to the top
function backToTop() {
    window.scrollTo(0,0);
}

//used to make the loader button element visible
function showLoader(element) {
    element.style.display = "block";
}

//used to deactivate the loader button element
function deactivateLoader(element) {
    element.style.display = "none";
}

//used to process the form
//this includes cleaning the data, validating it, sending it off and retrieving a response
function processForm(e) {
    submitBtn.showLoader();
    if (e.preventDefault) e.preventDefault();
    document.getElementById("contact_submit")

    var email_t = document.getElementById("contact_e_mail").value;
    var subject_t = document.getElementById("contact_subject").value;
    var message_t = document.getElementById("contact_message").value;
    var mailList_t = document.querySelector('#contact_mail:checked').value? 1 : 0;

    var params = {email: email_t, mailList: mailList_t, subject: subject_t, message: message_t};
    console.log(params);
    var errMessage = validateFormData(params);
    if(errMessage.length === 0){
        redirectAndPostForm("", params)
    } else {
        console.log("deactivate loader");
        deactivateLoader(submitLoader);
        reveal(errMessage);
    }

    return false;
}

//used to validate the form input
//return an erorr string if there is an error in the data
function validateFormData (params) {
    var errMessage = "";
    var err = trimParams(params);
    if(err) {
        return "Empty Fields";
    }

    if (isNaN(params.mailList)) {
        return "Invalid Form";
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

//used to construct a copy of the form to send of the data with
function redirectAndPostForm(url, data) {
    var form = document.createElement("form");
    document.body.appendChild(form);
    form.method = "POST";
    form.action = url;
    for (var name in data) {
        var input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = data[name];
        form.appendChild(input);
    }


    var XHR = new XMLHttpRequest();

    // Define what happens on successful data submission
    XHR.addEventListener("load", function(event) {
        deactivateLoader(submitLoader);
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
}

//used to retrieve blogs, by posting a AJAX request and parsing the response
//this uses JSON, for easier futhur development
function retrieveBlogs() {
    blogsBtn.showLoader();
    var count = document.querySelectorAll("#blog_section > article").length;
    var XHR = new XMLHttpRequest();
    XHR.addEventListener("load", function(event) {
        var list = JSON.parse(this.responseText);
        var more = list.splice(-1,1)[0];
        if(!more["more"]) {
            blogsBtn.removeEventListener("click", retrieveBlogs);
            console.log("disabling show loader");
            blogsBtn.removeEventListener("click", blogsBtn.showLoader);
            blogsBtn.className = "fadeout";
            blogsBtn.innerHTML = "no more";  
        }
        deactivateLoader(blogsLoader);
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

    //used template JSON blogs, and inject them into the html
    function getBlogHTML(rows) {

        var text = "";
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

}




//used to retrieve projects, by posting an AJAX request and parsing the response
//this uses JSON, for easier futhur development
function retrieveProjects() {
    projectsBtn.showLoader();
    var count = document.querySelectorAll("#projects_section > article").length;
    var XHR = new XMLHttpRequest();
    XHR.addEventListener("load", function(event) {
        var list = JSON.parse(this.responseText);
        var more = list.splice(-1,1)[0];
        if(!more["more"]) {
            projectsBtn.removeEventListener("click", retrieveProjects);
            console.log("disabling show loader");
            projectsBtn.removeEventListener("click", projectsBtn.showLoader);
            projectsBtn.className = "fadeout";
            projectsBtn.innerHTML = "no more";  
        }
        deactivateLoader(projectsLoader);
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

    //used template JSON projects, and inject them into the html
    function getProjectHTML(rows) {

        var text = "";
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

}

//used to reveal the message slider
function reveal(text) {
    console.log(text);
    document.querySelector('#slider').innerHTML = text;
    $('#slider').fadeIn();
    $('#slider').delay(1000).fadeOut();
}




