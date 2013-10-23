#!/bin/env node
var connect = require('connect');
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
connect.createServer(connect.static(__dirname+'/build')).listen(port);
console.log("Server started on port "+port);