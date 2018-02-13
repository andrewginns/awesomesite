var scroll = 0;
var wasScrolling =false;

var checkScroll = function () {
    var newScroll = window.scrollY;
    //console.log(newScroll);
    if(scroll !== newScroll) {
        scroll = newScroll;
        if (!wasScrolling) {
            wasScrolling = true;
            document.getElementById("nav-bar").style.opacity = 0.8;
        }//else do nothing
    } else if (wasScrolling) {//no longer scrolling, make opaque
            wasScrolling = false;
            document.getElementById("nav-bar").style.opacity = 1;
    } //else remained static
}

setInterval(checkScroll, 100);