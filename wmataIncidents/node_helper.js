/* Magic Mirror
 * Node Helper: Calendar
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

		if(notification === "START_WMATAINCIDENTS"){
			// console.log('Node helper got message start wmata');
			self.fetch(payload.apiKey, function(retIncidents) {
				self.sendSocketNotification("WMATAINCIDENTS_DATA_RESPONSE", 
					{
						
						incidents: retIncidents,
						notEmptyData: 1
					}
				);
			});
		}

	},


	fetch: function(apiKey, cb) {

    // console.log("entering incidents fetch");
		var options = {
		  url: 'https://api.wmata.com/Incidents.svc/json/Incidents',
		  headers: {
		    'api_key': apiKey
		  }
		};

		function callback(error, response, body) {
	 	  // console.log("fetch returned: "+ response.statusCode);
		  if (!error && response.statusCode == 200) {
		    var info = JSON.parse(body);
		    cb( info.Incidents );
		  } else {
		  	console.log(error);
		  }
		}

		request(options, callback);

// {
//   "Incidents": [
//     {
//       "IncidentID": "835A7D8D-7112-479F-ABAF-5BEA298D3AE0",
//       "Description": "Red Line: Trains are single tracking btwn Dupont Circle & Van Ness due to scheduled track work. Expect delays through tonight's closing.",
//       "StartLocationFullName": null,
//       "EndLocationFullName": null,
//       "PassengerDelay": 0.0,
//       "DelaySeverity": null,
//       "IncidentType": "Delay",
//       "EmergencyText": null,
//       "LinesAffected": "RD;",
//       "DateUpdated": "2016-12-24T19:49:51"
//     }
//   ]
// }


	}

});