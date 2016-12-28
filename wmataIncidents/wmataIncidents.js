/* global Module */

/* Magic Mirror
 * Module: WmataIncidents
 * 
 * Shows wmata incidents
 *
 * By @derickson
 * based on MagicMirror work by Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */

Module.register("wmataIncidents",{

	// Default module config.
	defaults: {
		apiKey: null,

		updateInterval: 10 * 60 * 1000, // every 10 minutes
		animationSpeed: 1000,
		timeFormat: config.timeFormat,

		testEnabled: false,
		testIncidents: [
			{
				"IncidentID": "835A7D8D-7112-479F-ABAF-5BEA298D3AE0",
				"Description": "Red Line: Trains are single tracking btwn Dupont Circle & Van Ness due to scheduled track work. Expect delays through tonight's closing.",
				"StartLocationFullName": null,
				"EndLocationFullName": null,
				"PassengerDelay": 0.0,
				"DelaySeverity": null,
				"IncidentType": "Delay",
				"EmergencyText": null,
				"LinesAffected": "RD;",
				"DateUpdated": "2016-12-24T19:49:51"
			}
		],

		initialLoadDelay: 0, // 0 seconds delay	
		retryDelay: 10000
	},

	// Define required scripts.
	getScripts: function() {
		return ["moment.js"];
	},

	// Define required styles.
	getStyles: function() {
		return ['wmataIncidents.css'];
	},

	start: function() {
		Log.info("Starting module: " + this.name);

		// Set locale.
		moment.locale(config.language);

		// variables that will be loaded from service
		this.incidents = [];

		// start the timer
		this.loaded = false;
		
		this.scheduleUpdate(0);
		this.updateTimer = null;


	},

	// start load timer (with posibility of delay)
	scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}

		var self = this;
		setTimeout(function() {
			self.updateWmata();
		}, nextLoad);
	},

	// reach out to WMATA service
	updateWmata: function() {
	
		var self = this;
		self.sendSocketNotification("START_WMATAINCIDENTS", {
			apiKey: self.config.apiKey
		});

	},

	socketNotificationReceived: function(notification, payload) {
		// console.log('wmata incidents listing to notification: '+ notification);
		if (notification === "WMATAINCIDENTS_DATA_RESPONSE") {
			// console.log('wmata received message for data call');
			this.incidents = payload.incidents;
			
			if(this.config.testEnabled){
				this.incidents = this.config.testIncidents;
			}

			this.processWmata(null);
			this.scheduleUpdate(-1);
		}
	},



	// unload the results from wmata services
	processWmata: function(result) {
		console.log("ProcessWmataIncidents");
		console.log(result);

		// when done, redraw the module
		this.loaded = true;
		this.updateDom(this.config.animationSpeed);
	},


	// Override dom generator.
	getDom: function() {
		var wrapper = document.createElement("div");

		var wmata = document.createElement("div");
		wmata.className = "wmataContainer";
		

		if(this.loaded) {


			var table = document.createElement("table");
			table.className = "small";

			for (var f in this.incidents) {
				var incidents = this.incidents[f];

				var row = document.createElement("tr");
				table.appendChild(row);

				computedText = incidents.Description; 

				var textCell = document.createElement("td");
				textCell.className = "wmataText";
				textCell.innerHTML = computedText;
				row.appendChild(textCell);

				// var iconCell = document.createElement("td");
				// iconCell.className = "badgeCell";
				// var wmataIcon = document.createElement("img");
				// wmataIcon.className = "badge";
				// wmataIcon.src = "modules/derickson/wmata/wmata.png";
				// iconCell.appendChild(wmataIcon);
				// row.appendChild(iconCell);

				// var stationCell = document.createElement("td");
				// stationCell.className = "dest";
				// stationCell.innerHTML = train.DestinationName;
				// row.appendChild(stationCell);

				// var minCell = document.createElement("td");
				// minCell.innerHTML = train.Min;
				// minCell.className = "align-right minCell";
				// row.appendChild(minCell);

			}

			return table;

		} else {
			// Loading message

			var wmataIcon = document.createElement("img");
			wmataIcon.className = "badge";
			wmataIcon.src = "modules/derickson/wmata/wmata.png";

			var wmataText = document.createElement("span");

			wmataText.innerHTML = "Checking Wmata status ...";

			wmata.appendChild(wmataIcon);
			wmata.appendChild(wmataText);
		}
		


		
		wrapper.appendChild(wmata);
		return wrapper;
	}

});
