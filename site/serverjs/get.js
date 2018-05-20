// Make a request and print out the response.

var http = require('http');

var params = {
    'host': 'localhost',
    'port': 8080,
    'path': '/hi//index.html',
    'method': 'GET',
};

var request = http.request(params);
request.on('response', header);
request.end();

function header(response) {
    console.log("Status code:",  response.statusCode);
    response.on("data", body);
}

function body(data) {
    console.log(data.toString());
}