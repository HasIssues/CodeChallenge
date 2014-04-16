var azure = require("azure");

exports.request = function (req, res) {
    var fs = require("fs");
    var requestHost = req.headers.host.toLowerCase();
    var requestReferer = req.headers.referer;
    var requestHttpVersion = req.httpVersion;
    var requestURL = req.url;
    var requestMethod = req.method;
    if (requestURL == "/" || requestURL == "") { requestURL = "/home.html"; }
    console.log("request:" + requestURL);
    if (requestURL.endsWith(".html")) {
        fs.readFile("." + requestURL, "utf8", function (err, data) {
            if (err) {
                res.writeHead(404, { 'Content-Type': "text/html", 'error': 'File Not Found.' });
                res.end("OPPS");
            } else {
                res.writeHead(200, { 'Content-Type': "text/html" });
                res.end(data);
            }
        });
    } else if (requestURL.endsWith(".js")) {
        fs.readFile("." + requestURL, "utf8", function (err, data) {
            if (err) {
                res.writeHead(404, { 'Content-Type': "text/javascript", 'error': 'File Not Found.' });
                res.end("OPPS");
            } else {
                res.writeHead(200, { 'Content-Type': "text/javascript" });
                res.end(data);
            }
        });
    } else if (requestURL.endsWith(".css")) {
        fs.readFile("." + requestURL, "utf8", function (err, data) {
            if (err) {
                res.writeHead(404, { 'Content-Type': "text/css", 'error': 'File Not Found.' });
                res.end("OPPS");
            } else {
                res.writeHead(200, { 'Content-Type': "text/css" });
                res.end(data);
            }
        });
    } else if (requestURL.endsWith(".json")) {
        var MongoClient = require("mongodb").MongoClient;
        var format = require("util").format;
        MongoClient.connect("mongodb://readuser:reader1234@SG-mssmongodev02-874.servers.mongodirector.com:27017/dev-test", function(err, db) {
            console.log("Connected to MongoDB");
            if (err) {
                res.writeHead(404, { 'Content-Type': "application/json", 'error': 'File Not Found.' });
                res.end("[]");
            } else {
                res.writeHead(200, { 'Content-Type': "application/json" });
                var data = db.collection("titles").find().limit(100).toArray(function(err, docs) {
                    if (!err) { res.end(JSON.stringify(docs)); }
                });
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': "text/html", 'error': 'File Not Found.' });
        res.end("OPPS");
    }
};

String.prototype.endsWith = function(suffix) { return this.indexOf(suffix, this.length - suffix.length) !== -1; };
String.prototype.startsWith = function(str) {return (this.match("^"+str)==str)};
String.prototype.trim = function() { return (this.replace(/^[\s\xA0]+/, "").replace(/[\s\xA0]+$/, "")) };
String.prototype.toProperCase = function() {return this.toLowerCase().replace(/^(.)|\s(.)/g,function($1) { return $1.toUpperCase(); });};
