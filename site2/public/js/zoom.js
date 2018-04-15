"use strict";
addEventListener('DOMContentLoaded', zoom_start);

function zoom_start(){
    
    window.onbeforeunload = backToTop;
    window.unload = backToTop;
    
    // only proceed if CSS transforms are supported
    if (!Modernizr.csstransforms) {
        return;
    }

    init();
    
    function backToTop() {
        window.scrollTo(0, 0);
    }
    
    //helper functions
    function init() {
        var content = document.getElementById('content'),
            // init Zoomer constructor
            ZUI = new Zoomer(content);
    }

    // the constructor that will do all the work
    function Zoomer(content) {
        // keep track of DOM
        this.content = content;

        // position of vertical scroll
        this.scrolled = 0;
        // zero-based number of sections
        this.levels = 3;
        // height of document
        this.docHeight = document.documentElement.offsetHeight;

        // bind Zoomer to scroll event
        window.addEventListener( 'scroll', this, false);
        //console.log("eventListener attached");
    }

    // enables constructor to be used within event listener
    // like obj.addEventListener( eventName, this, false )
    Zoomer.prototype.handleEvent = function(event) {
        if (this[event.type]) {
            this[event.type](event);
        }
    };

    // triggered every time window scrolls
    /*Controls the zoom when scrolling*/      
    Zoomer.prototype.scroll = function(event) {
        // normalize scroll value from 0 to 1
        this.scrolled = window.scrollY / (this.docHeight - window.innerHeight);
        var scale = Math.pow(3, this.scrolled * -this.levels), transformValue = 'scale('+scale+')';

        this.content.style.WebkitTransform = transformValue;
        this.content.style.MozTransform = transformValue;
        this.content.style.OTransform = transformValue;
        this.content.style.transform = transformValue;
    };

}

/* Modernizr custom build of 1.7: csstransforms | csstransitions | iepp */
window.Modernizr = function(a, b, c) {
    function G() {}

    function F(a, b) {
        var c = a.charAt(0).toUpperCase() + a.substr(1),
            d = (a + " " + p.join(c + " ") + c).split(" ");
        return !!E(d, b)
    }

    function E(a, b) {
        for (var d in a)
            if (k[a[d]] !== c && (!b || b(a[d], j))) return !0
    }

    function C(a, b) {
        return typeof a === b
    }

    function A(a) {
        k.cssText = a
    }
    var d = "1.7",
        e = {},
        f = !0,
        g = b.documentElement,
        h = b.head || b.getElementsByTagName("head")[0],
        i = "modernizr",
        j = b.createElement(i),
        k = j.style,
        l = b.createElement("input"),
        m = ":)",
        n = Object.prototype.toString,
        o = " -webkit- -moz- -o- -ms- -khtml- ".split(" "),
        p = "Webkit Moz O ms Khtml".split(" "),
        q = {
            svg: "http://www.w3.org/2000/svg"
        },
        r = {},
        s = {},
        t = {},
        u = [],
        v = {},
        x = function() {
            var a = {
                select: "input",
                change: "input",
                submit: "form",
                reset: "form",
                error: "img",
                load: "img",
                abort: "img"
            };
            return d
        }(),
        y = ({}).hasOwnProperty,
        z;
    C(y, c) || C(y.call, c) ? z = function(a, b) {
        return b in a && C(a.constructor.prototype[b], c)
    } : z = function(a, b) {
        return y.call(a, b)
    }, r.csstransforms = function() {
        return !!E(["transformProperty", "WebkitTransform", "MozTransform", "OTransform", "msTransform"])
    }, r.csstransitions = function() {
        return F("transitionProperty")
    };
    for (var H in r) z(r, H) && (v = H.toLowerCase(), e[v] = r[H](), u.push((e[v] ? "" : "no-") + v));
    e.input || G(), e.crosswindowmessaging = e.postmessage, e.historymanagement = e.history, e.addTest = function(a, b) {
    }, A(""), j = l = null, f && a.attachEvent && function() {
    }() && function(a, b) {
    }(a, b), e._enableHTML5 = f, e._version = d, g.className = g.className.replace(/\bno-js\b/, "") + " js " + u.join(" ");
    return e
}(this, this.document);