/* Magic Mirror
 * Node Helper: wunderground
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
		if(notification === "LOG_WUNDERGROUND"){
			self.logMetric("wunderground", payload.url, payload.username, payload.password, payload.payload);
		}
	},

	logMetric: function(channel, url, username, password, payload) {
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
		  	console.log("logmetric failure: " + error + "; " + response.statusCode + "; " + body);
		  }
		}

		request(options, callback);
	}

});