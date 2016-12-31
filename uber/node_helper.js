/* Magic Mirror
 * Node Helper: uber
 * 
 * by @derickson
 * based on work By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");

var request = require("request");

module.exports = NodeHelper.create({
	// Override start method.
	start: function() {
		var self = this;
		console.log("Starting node helper for: " + this.name);
	},

	// Override socketNotificationReceived method.
	socketNotificationReceived: function(notification, payload) {
		var self = this;
		if(notification === "LOG_UBER"){
			self.logMetric("uber2", payload.url, payload.username, payload.password, payload.payload);
		}
	},

	logMetric: function(channel, url, username, password, payload) {
		// console.log("uber logging 2");
		var requestData = {
			'metric_source': "MagicMirror",
			'metric_channel': channel,
			'payload': payload
		};

		var composeUrl = "https://" + username + ":" + password + "@" + url;

		var options = {
		  'url': composeUrl,
		  'method': 'POST',
		  'json': true,
		  'body': requestData
		};

		function callback(error, response, body) {
		  if (!error && response.statusCode == 200) {
		    // console.log("logmetric success");
		  } else {
		  	console.log("logmetric failure: " + error );
		  	console.log(response.statusCode + "; " + body);
		  }
		}

		request(options, callback);
	}

});