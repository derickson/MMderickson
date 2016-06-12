/* Magic Mirror
 * Node Helper: Calendar
 * 
 * by @derickson
 * based on work By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");

var request = require("request");
var xml2js = require('xml2js');

module.exports = NodeHelper.create({
	// Override start method.
	start: function() {
		var self = this;
		
		console.log("Starting node helper for: " + this.name);

	},

	// Override socketNotificationReceived method.
	socketNotificationReceived: function(notification, payload) {
		var self = this;

		if(notification === "START_CABI"){
			console.log('Node helper got message start cabi');
			self.fetch(payload.stationName, function(station) {
				self.sendSocketNotification("CABI_DATA_RESPONSE", 
					{
						numBikes: parseInt(station.nbBikes[0]), 
						numFreeSlots: parseInt(station.nbEmptyDocks[0])
					}
				);
			});
		}

	},


	fetch: function(stationName, cb) {
		request( "https://www.capitalbikeshare.com/data/stations/bikeStations.xml", function(error, response, body){
			if(!error && response.statusCode === 200) {
				xml2js.parseString(body, function(err, result){
					if(!err){
						var stationArray = result.stations.station;
						for( k in stationArray ){
							var station = stationArray[k];
							
							if(station.name[0] === stationName){
								cb(station);
								break;
							}
						}
					} else {
						console.log(err);
					}
				});
			} else {
				console.log("Error in request to cabi service");
			}
		});
	}

});