http = null;
azure = null;
var fs = require("fs");
var os = require("os");
var presenter = require("./presenter.js");

//-- vars
var configName = "LOCAL";
var numCPUs = os.cpus().length;
var machineName = os.hostname().toUpperCase();
var webServerAddress = "";
var port = 80;
var useCluster = true;
var useHttpSys = false;
var clusterForks = 2;
var serverOptions = { };

//-- are we in Azure or IIS
if (process.env.PORT != undefined) {
	http = require("http");
	azure = require("azure");
	configName = "AZURE";
	port = process.env.PORT || 1337;
} else {
    webServerAddress = "http://www.sneakerz.com";
	port = "80";
	useHttpSys = false;
	//clusterForks = numCPUs;
	if (useHttpSys) {
		//-- uses native http.sys on windows only
		console.log("Using Native Mode HTTP.sys");
		serverOptions = { "HTTPSYS_CACHE_DURATION": 0, "HTTPSYS_BUFFER_SIZE": 16384, "HTTPSYS_REQUEST_QUEUE_LENGTH": 10000, "HTTPSYS_PENDING_READ_COUNT": 5 };
		http = require("httpsys").http();
	} else {
		http = require("http");
	}
}

//-- HTTP Server for redirect
var serverRequest = function (req, res) {
	var requestHost = req.headers.host; 
	var requestReferer = req.headers.referer;
	var requestHttpVersion = req.httpVersion;
	var requestURL = req.url;
	var requestMethod = req.method;
	//-- now lets respond to a request
    try {
        presenter.request(req, res);
    } catch (e) {
        res.writeHead(500, { 'Content-Type': 'text/html'});
        res.end(e.message);
    }
};

//-- start listener based on config
if (configName == "LOCAL" && useCluster) {
	var cluster = require("cluster");
	if (cluster.isMaster) {
		console.log("Machine " + machineName  + " with " + numCPUs + " CPUs. In cluster Mode.");
		console.log("Running Node Version " + process.versions.node);
		for (var i = 1; i <= clusterForks; i++) { cluster.fork(); }
		cluster.on("exit", function(worker, code, signal) { var exitCode = worker.process.exitCode; console.log("worker " + worker.process.pid + " died (" + exitCode + "). restarting..."); cluster.fork(); });
		cluster.on('listening', function(worker, address) { console.log("Worker " + worker.process.pid + " listening  on " + address.port); });
	} else {
		// Workers can share any TCP connection, In this case its a HTTP server
		var server = http.createServer(function (req, res) { serverRequest(req, res); }).listen(port);
	}
} else if (configName == "LOCAL" && useHttpSys) {
	console.log("Machine " + machineName  + " with " + numCPUs + " CPUs. Using HttpSys.");
	console.log("Running Node Version " + process.versions.node);
    try {
        var server = http.createServer(serverOptions, function (req, res) { serverRequest(req, res); }).listen(webServerAddress + ":" + port + "/");
        console.log("WEB SERVER: " + webServerAddress + ":" + port + "/");
    } catch (e) {
        console.log("FAIL WEB SERVER: " + webServerAddress + ":" + port + "/");
    }
} else {
	var server = http.createServer(function (req, res) { serverRequest(req, res); }).listen(port);
	console.log("Machine " + machineName  + " with " + numCPUs + " CPUs.");
	console.log("Running Node Version " + process.versions.node);
	console.log("Listing on port " + port);
}
