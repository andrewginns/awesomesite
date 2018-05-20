"use strict";

//used to run the javascript once the page is loaded
addEventListener('load', initContent);

var projectsLoader;
var blogsLoader;
var blogsBtn;
var projectsBtn;
var submitBtn;
var submitLoader;
var aboutLoader;

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

    aboutLoader = document.getElementById("about_loader");
    console.log(aboutLoader);
    retrieveBlogs();
    retrieveProjects();
    retrieveAbout();
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
    
    if (params.subject.length > 100) {
        return "Subject Too Long";
    }
    
    if (params.message.length > 1000) {
        return "Message Too Long";
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
    receiveData(XHR, true, formReply);

    // Bind the FormData object and the form element
    var FD = new FormData(form);
    // Set up our request
    XHR.open("POST", url);
    // The data sent is what the user provided in the form
    XHR.send(FD);

    //used to report the response from the server and deactivate the loader
    function formReply(reply) {
        deactivateLoader(submitLoader);
        reveal(reply.responseText);
    }
}

//used to retrieve blogs, by posting a AJAX request and parsing the response
//this uses JSON, for easier futhur development
function retrieveBlogs() {
    blogsBtn.showLoader();
    var count = document.querySelectorAll("#blog_section > article").length;
    var XHR = new XMLHttpRequest();
    receiveData(XHR, false, blogsResponse);

    XHR.open("POST", "", true);
    //XHR.setRequestHeader("Content-type", "text/html");
    XHR.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    XHR.send("blogs=1&itemCount=" +count);
    // Define what happens on successful data submission

    //this processes the the response containing the blogs data
    //it disables the loader and injects html if html for the blog/s is generated.
    function blogsResponse(reply) {
        var list = JSON.parse(reply.responseText);
        var more = list.splice(-1,1)[0];
        if(!more["more"]) {
            blogsBtn.removeEventListener("click", retrieveBlogs);
            console.log("disabling show loader");
            blogsBtn.removeEventListener("click", blogsBtn.showLoader);
            blogsBtn.className = "fadeout";
            blogsBtn.innerHTML = "no more";  
        }
        deactivateLoader(blogsLoader);
        blogsLoader.insertAdjacentHTML("beforebegin", getBlogHTML(list));
    }

    //used to template JSON blogs
    function getBlogHTML(rows) {

        var text = "";
        if(rows.length > 0) {
            for (let index in rows) {
                text += blogHtml(rows[index])+ "\n";
            }
        }

        return text;

        //used to template an html blog
        function blogHtml(row){
            var actualDate = getTime(row.date);
            var html = ["<article>", 
                        "<h2 class ='title'>"+ row.title +"</h2>",
                        "<h2 class ='date'>"+ actualDate +"</h2>",
                        "<p>"+ row.message + "</p>",
                        "<div class='spacer'></div>",
                        "</article>"].join("\n");
            return html;
        }
    }

}

//used to retrieve the about section, by posting a AJAX request and parsing the response
//this is retrieved as plain text
function retrieveAbout() {
    showLoader(aboutLoader);
    var count = document.querySelectorAll("#about_section > article").length;
    var XHR = new XMLHttpRequest();
    receiveData(XHR, true, aboutResponse);

    XHR.open("POST", "", true);
    //XHR.setRequestHeader("Content-type", "text/html");
    XHR.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    XHR.send("about=1");
    // Define what happens on successful data submission

    //this processes the the response containing the blogs data
    //it disables the loader and injects html if html for the blog/s is generated.
    function aboutResponse(reply) {
        deactivateLoader(aboutLoader);
        aboutLoader.insertAdjacentHTML("beforebegin", getAboutHtml(reply.responseText));

        //used to create and return the about html
        function getAboutHtml(text) {
            var html = ["<article>",
                        "<p>"+ text + "</p>",
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
    receiveData(XHR, false, projectsResponse);

    XHR.open("POST", "", true);
    //XHR.setRequestHeader("Content-type", "text/html");
    XHR.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    XHR.send("projects=1&itemCount=" +count);
    // Define what happens on successful data submission

    //this processes the the response containing the projects data
    //it disables the loader and injects html if html for the project/s is generated.
    function projectsResponse(reply) {
        var list = JSON.parse(reply.responseText);
        var more = list.splice(-1,1)[0];
        if(!more["more"]) {
            projectsBtn.removeEventListener("click", retrieveProjects);
            projectsBtn.className = "fadeout";
            projectsBtn.innerHTML = "no more";  
        }
        deactivateLoader(projectsLoader);
        projectsLoader.insertAdjacentHTML("beforebegin", getProjectHTML(list));
    }


    //used to template JSON projects
    function getProjectHTML(rows) {

        var text = "";
        if(rows.length > 0) {
            for (let index in rows) {
                text += projectHtml(rows[index])+ "\n";
            }
        }
        return text;

        //used to template an html blog
        function projectHtml(row){
            var actualDate = getTime(row.date);

            var html = ["<article>", 
                        "<h2 class ='title'>"+ row.title +"</h2>",
                        "<h2 class ='date'>"+ actualDate +"</h2>",
                        "<p>"+ row.message + "</p>",
                        "<div class='spacer'></div>",
                        "</article>"].join("\n");
            return html;

        }
    }

}

//sets the AJAX response callback
//funcRef is the reference to the function to be actually used on successful responses or if neatReport is set
//neatReport will display the error message within the website
function receiveData(q, neatReport, funcRef) {
    q.onreadystatechange = receive;

    //wrapper function to receive the response
    function receive (err, data) {
        // Define what happens in case of error
        if (this.readyState != XMLHttpRequest.DONE)return;
        if (neatReport || this.status == 200) {
            funcRef(this);
        } else {
            // Define what happens in case of error
            alert('Oops! Something went wrong.');
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

//used to get the current time in UK standard format
function getTime(date) {
    date  = new Date(date);
    console.log(date);
    var dd = date.getDate();
    var mm = date.getMonth()+1; //January is 0!
    var yyyy = date.getFullYear();
    if(dd<10){
        dd='0'+dd;
    } 
    if(mm<10){
        mm='0'+mm;
    } 
    var today = dd+'/'+mm+'/'+yyyy;
    return today;
}



