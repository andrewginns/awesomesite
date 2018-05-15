// Run a node.js web server for local development of a static web site.
// Start with "node server.js" and put pages in a "public" sub-folder.
// Visit the site at the address printed on the console.

// The server is configured to be platform independent.  URLs are made lower
// case, so the server is case insensitive even on Linux, and paths containing
// upper case letters are banned so that the file system is treated as case
// sensitive even on Windows.  All .html files are delivered as
// application/xhtml+xml for instant feedback on XHTML errors.  To improve the
// server, either add content negotiation (so old browsers can be tested) or
// switch to text/html and do validity checking another way (e.g. with vnu.jar).

// Choose a port, e.g. change the port to the default 80, if there are no
// privilege issues and port number 80 isn't already in use. Choose verbose to
// list banned files (with upper case letters) on startup.

var port = 8080;
var verbose = true;

// Load the library modules, and define the global constants.
// See http://en.wikipedia.org/wiki/List_of_HTTP_status_codes.
// Start the server:
var http = require("http");
var https = require("https");
var fs = require("fs");
var qs = require("querystring");


var OK = 200, BadRequest = 400, NotFound = 404, BadType = 415, Error = 500;
var types, banned;
start();

// Start the http service. Accept only requests from localhost, for security.
function start() {
    if (!checkSite()) return;
    types = defineTypes();
    banned = [];
    banUpperCase("./public/", "");

    //var app = express();

    //used to add an SSL certificate to the website
    var privateKey =  fs.readFileSync('./ssl/key.pem');
    var certificate = fs.readFileSync('./ssl/cert.pem');
    var credentials = {key: privateKey, cert: certificate};

    var service = https.createServer(credentials, handle);
    service.listen(port, "localhost");//this makes the server listen on localhost, good practice for development/security
    var address = "https://localhost";
    if (port != 80) address = address + ":" + port;
    console.log("Server running at", address);
}

// Check that the site folder and index page exist.
function checkSite() {
    var path = "./public";
    var ok = fs.existsSync(path);
    if (ok) path = "./public/index.html";
    if (ok) ok = fs.existsSync(path);
    if (!ok) console.log("Can't find", path);
    return ok;
}

//Used to log the most important request information
function logRequestInfo(request){
    console.log("Method:", request.method);
    console.log("URL:", request.url);
    console.log("Headers:", request.headers);
}

//Used to validate urls. returns true if url is invalid, otherwise false
function invalidURL(url){
    var ascii = /^[ -~]+$/;
    return !ascii.test(url) ||
        !url.startsWith("/") || 
        url.includes("..") ||
        url.includes("/.") ||
        url.includes("//");
}

// Serve a request by delivering a file.
function handle(request, response) {
    //if (verbose) logRequestInfo(request);
    //to make system directories style standard
    var url = request.url.toLowerCase().replace(/\\/g, "/");
    //for debugging
    console.log(""+url);
    if (url.endsWith("/")) url = url + "index.html";
    if (invalidURL(url)) return fail(response, BadRequest, "Permission denied");   
    if (isBanned(url)) return fail(response, NotFound, "URL has been banned");
    console.log(request.method);
    
    if(request.method.toString().toLowerCase() === "post") {
        handlePostRequest(request, response);
    } else if (request.method.toString().toLowerCase() === "get"){
        handleGetRequest(url, request, response);
    } 
}

function handleGetRequest(url, request, response) {
    var type = findType(request, url);
    if (type == null) return fail(response, BadType, "File type unsupported");
    var file = "./public" + url;
    fs.readFile(file, ready);
    console.log(ready);
    function ready(err, content) { deliver(response, type, err, content); } 
}

// Deal with a request.
function handlePostRequest(request, response) {
    var body = {text: ""};
    request.on('data', add.bind(null, body));
    request.on('end', end.bind(null, body, request, response));
}

function add(body, chunk) {
    body.text = body.text + chunk.toString();
}

function end(body, request, response) {
    console.log("Body:", body.text);
    reply(body, request, response);
}

// Send a reply.
function reply(body, request, response) {
    var params = qs.parse(body.text);
    console.log(params.email, params.subject, params.message); 
    var url = "/index.html";
    handleGetRequest(url, request, response);
}


// Forbid any resources which shouldn't be delivered to the browser.
function isBanned(url) {
    for (var i=0; i<banned.length; i++) {
        var b = banned[i];
        if (url.startsWith(b)) return true;
    }
    return false;
}

// Find the content type to respond with, or undefined.
function findType(request, url) {
    var dot = url.lastIndexOf(".");
    var extension = url.substring(dot + 1);
    return htmlContentNegotiation(request, extension, types[extension]);
}

//This function is used to send the html file as standard html if xhtml is not supported
function htmlContentNegotiation(request, extension, type) {
    if("html" === extension) {
        var otype = "text/html";
        var header = request.headers.accept;
        var header = null;
        if (header != null) {
            var accepts = header.split(",");
            if(accepts.indexOf(type) < 0){
                type = otype;
                console.log("negotiated content");
            } 
        }else {
            type = otype;
        }
    }
    return type;
}

// Deliver the file that has been read in to the browser.
function deliver(response, type, err, content) {
    if (err) return fail(response, NotFound, "File not found");
    var typeHeader = { "Content-Type": type };
    response.writeHead(OK, typeHeader);
    response.write(content);
    response.end();
}

// Give a minimal failure response to the browser
function fail(response, code, text) {
    var textTypeHeader = { "Content-Type": "text/plain" };
    response.writeHead(code, textTypeHeader);
    response.write(text, "utf8");
    response.end();
}

// Check a folder for files/subfolders with non-lowercase names.  Add them to
// the banned list so they don't get delivered, making the site case sensitive,
// so that it can be moved from Windows to Linux, for example. Synchronous I/O
// is used because this function is only called during startup.  This avoids
// expensive file system operations during normal execution.  A file with a
// non-lowercase name added while the server is running will get delivered, but
// it will be detected and banned when the server is next restarted.
function banUpperCase(root, folder) {
    var folderBit = 1 << 14;
    var names = fs.readdirSync(root + folder);
    for (var i=0; i<names.length; i++) {
        var name = names[i];
        var file = folder + "/" + name;
        if (name != name.toLowerCase()) {
            if (verbose) console.log("Banned:", file);
            banned.push(file.toLowerCase());
        }
        var mode = fs.statSync(root + file).mode;
        if ((mode & folderBit) == 0) continue;
        banUpperCase(root, file);
    }
}

// The most common standard file extensions are supported, and html is
// delivered as "application/xhtml+xml".  Some common non-standard file
//some extensions are explicitly excluded.  This table is defined using a function
// rather than just a global variable, because otherwise the table would have
// to appear before calling start().  NOTE: add entries as needed or, for a more
// complete list, install the mime module and adapt the list it provides.
function defineTypes() {
    var types = {
        html : "application/xhtml+xml",
        css  : "text/css",
        js   : "application/javascript",
        png  : "image/png",
        gif  : "image/gif",    // for images copied unchanged, not standard remove
        jpeg : "image/jpeg",   // for images copied unchanged, not standard, remove
        jpg  : "image/jpeg",   // for images copied unchanged, not standard remove
        svg  : "image/svg+xml",
        json : "application/json",
        pdf  : "application/pdf",
        txt  : "text/plain",
        ttf  : "application/x-font-ttf",
        woff : "application/font-woff",
        aac  : "audio/aac",
        mp3  : "audio/mpeg",
        mp4  : "video/mp4",
        webm : "video/webm",
        ico  : "image/x-icon", // just for favicon.ico
        xhtml: undefined,      // non-standard, use .html
        htm  : undefined,      // non-standard, use .html
        rar  : undefined,      // non-standard, platform dependent, use .zip
        doc  : undefined,      // non-standard, platform dependent, use .pdf
        docx : undefined,      // non-standard, platform dependent, use .pdf
    }
    return types;
}
