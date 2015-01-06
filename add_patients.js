/* Adds patients asynchronously to test for concurrency on the server */

var request = require('request');

// server is configured to perform a non-blocking sleep of random value
// add 20 patients
for (i=0; i<20; i++) {
	console.log("Req. #" + i + "] init");
	addPatient(i);
}

/* Use req_id to track individual requests - all responses are piped into printResults() */
function addPatient(req_id) {
	request
		.post('http://tonyandrys.com:8080/api/patients', {form:{mapp_id:"deleteme", authcode: "1234"}})
		.on('error', function(err) {
			console.log(err);
		})
		.on('response', function(data) {
			printResults(req_id, data);
		})
}

function printResults(req_id, data) {
	console.log("Req. #" + req_id + "] ** returned a result.");
}