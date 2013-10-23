#!/bin/env node

var connect = require('connect'),
	http = require('http');

var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var app = connect().use(connect.static('build'));
http.createServer(app).listen(port);
console.log("Server started on port "+port);