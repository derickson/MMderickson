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

		if(notification === "START_WMATA"){
			console.log('Node helper got message start wmata');
			self.fetch(payload.stationCode, payload.apiKey, function(retTrains) {
				self.sendSocketNotification("WMATA_DATA_RESPONSE", 
					{
						trains: retTrains
					}
				);
			});
		}

	},


	fetch: function(stationCode, apiKey, cb) {

		var options = {
		  url: 'https://api.wmata.com/StationPrediction.svc/json/GetPrediction/' + stationCode,
		  headers: {
		    'api_key': apiKey
		  }
		};

		function callback(error, response, body) {
		  if (!error && response.statusCode == 200) {
		    var info = JSON.parse(body);
		    cb( info.Trains );
		  }
		}

		request(options, callback);

		// var trains = [
		// 	{
  //     "Car": "6",
  //     "Destination": "SilvrSpg",
  //     "DestinationCode": "B08",
  //     "DestinationName": "Silver Spring",
  //     "Group": "1",
  //     "Line": "RD",
  //     "LocationCode": "B35",
  //     "LocationName": "NoMa-Gallaudet",
  //     "Min": "BRD"
  //   },
  //   {
  //     "Car": "6",
  //     "Destination": "Shady Gr",
  //     "DestinationCode": "A15",
  //     "DestinationName": "Shady Grove",
  //     "Group": "2",
  //     "Line": "RD",
  //     "LocationCode": "B35",
  //     "LocationName": "NoMa-Gallaudet",
  //     "Min": "2"
  //   },
  //   {
  //     "Car": "8",
  //     "Destination": "Glenmont",
  //     "DestinationCode": "B11",
  //     "DestinationName": "Glenmont",
  //     "Group": "1",
  //     "Line": "RD",
  //     "LocationCode": "B35",
  //     "LocationName": "NoMa-Gallaudet",
  //     "Min": "8"
  //   },
  //   {
  //     "Car": "6",
  //     "Destination": "Shady Gr",
  //     "DestinationCode": "A15",
  //     "DestinationName": "Shady Grove",
  //     "Group": "2",
  //     "Line": "RD",
  //     "LocationCode": "B35",
  //     "LocationName": "NoMa-Gallaudet",
  //     "Min": "10"
  //   },
  //   {
  //     "Car": "8",
  //     "Destination": "SilvrSpg",
  //     "DestinationCode": "B08",
  //     "DestinationName": "Silver Spring",
  //     "Group": "1",
  //     "Line": "RD",
  //     "LocationCode": "B35",
  //     "LocationName": "NoMa-Gallaudet",
  //     "Min": "12"
  //   },
  //   {
  //     "Car": "6",
  //     "Destination": "Shady Gr",
  //     "DestinationCode": "A15",
  //     "DestinationName": "Shady Grove",
  //     "Group": "2",
  //     "Line": "RD",
  //     "LocationCode": "B35",
  //     "LocationName": "NoMa-Gallaudet",
  //     "Min": "17"
  //   }
		// ];

		// cb(trains);

		// request( "https://www.capitalbikeshare.com/data/stations/bikeStations.xml", function(error, response, body){
		// 	if(!error && response.statusCode === 200) {
		// 		xml2js.parseString(body, function(err, result){
		// 			if(!err){
		// 				var stationArray = result.stations.station;
		// 				for( k in stationArray ){
		// 					var station = stationArray[k];
							
		// 					if(station.name[0] === stationName){
		// 						cb(station);
		// 						break;
		// 					}
		// 				}
		// 			} else {
		// 				console.log(err);
		// 			}
		// 		});
		// 	} else {
		// 		console.log("Error in request to cabi service");
		// 	}
		// });
	}

});