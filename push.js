/**
 * push.js
 * Push notification handling module for Amazon SNS
 * Tony Andrys
 */

// sns-mobile module handles the heavy work
var SNS = require('sns-mobile');

// Load AWS credentials from environment
var SNS_KEY_ID = process.env['SNS_KEY_ID'];
var SNS_ACCESS_KEY = process.env['SNS_ACCESS_KEY'];
var SNS_ANDROID_ARN = process.env['SNS_ANDROID_ARN'];	// Amazon SNS ARN
console.log(SNS_KEY_ID);
console.log(SNS_ACCESS_KEY);
console.log(SNS_ANDROID_ARN);

// Object represents the PlatformApplication we're interacting with
// NOTE: Just supports Android for now
var myApp = new SNS({
	platform: 'android',
	region: 'us-west-2',
	apiVersion: '2010-03-31',
	accessKeyId: SNS_KEY_ID,
	secretAccessKey: SNS_ACCESS_KEY,
	platformApplicationArn: SNS_ANDROID_ARN
});

// Handle user added events
myApp.on('userAdded', function(endpointArn, deviceId) {
	console.log('\nSuccessfully added device with deviceId: ' + deviceId + '.\nEndpointArn for user is: ' + endpointArn);
	// add other handlers to this callback 
});


// Publically exposed function
// Receives request and response objects - used by app.js
exports.register = function(req, res) {

	// When we receive a POST, extract the device_id and platform values from the data.
	var deviceId = req.body['device_id'];
	var platform = req.body['platform'];
	console.log('\nPush.js] Attempting to register user with deviceId: ' + deviceId);

	// Try to add this device to SNS...
	myApp.addUser(deviceId, null, function(err, endpointArn) {
		// Check if SNS returned an error
		if (err) {
			console.log("SNS RETURNED AN ERROR!");
			console.log(err);
			return res.status(500).json({
				status: 'not ok'
			});
		}

		// Otherwise, tell the user that everything's OK.
		else {
			res.status(200).json({
				status: 'ok'
			});
		}
	});

};