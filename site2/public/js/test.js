"use strict";
addEventListener('load', start);
function start() { 
    console.log("scroll to top");
    document.getElementById("home").addEventListener("click", scrollTo.bind(null, 0,0), false);
    document.getElementById("blog").addEventListener("click", jumpTo.bind(null, "blog_section"), false);
    document.getElementById("projects").addEventListener("click", jumpTo.bind(null, "projects_section"), false);
    document.getElementById("about").addEventListener("click", jumpTo.bind(null, "about_section"), false);
    document.getElementById("contact").addEventListener("click", jumpTo.bind(null, "contact_section"), false);
    
    console.log("listening for clicks")
} 

function jumpTo(element, event) {
    console.log(element);
    console.log(event);
	document.getElementById(element).scrollIntoView();
    console.log("click");
}







