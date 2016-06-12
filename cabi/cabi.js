/* global Module */

/* Magic Mirror
 * Module: Cabi
 * 
 * Shows the capital bikeshare stations available
 *
 * By @derickson
 * based on MagicMirror work by Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */

Module.register("cabi",{

	// Default module config.
	defaults: {
		stationName: null,

		updateInterval: 5 * 60 * 1000, // every 5 minutes
		animationSpeed: 1000,
		timeFormat: config.timeFormat,

		initialLoadDelay: 0, // 0 seconds delay	
		retryDelay: 10000
	},

	// Define required scripts.
	getScripts: function() {
		return ["moment.js"];
	},

	// Define required styles.
	getStyles: function() {
		return ['cabi.css'];
	},

	start: function() {
		Log.info("Starting module: " + this.name);

		// Set locale.
		moment.locale(config.language);

		// variables that will be loaded from service
		this.numBikes = null;
		this.numFreeSlots = null;

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
			self.updateCabi();
		}, nextLoad);
	},

	// reach out to cabi service
	updateCabi: function() {
	
		var self = this;
		self.sendSocketNotification("START_CABI", {stationName: self.config.stationName});

	},

	socketNotificationReceived: function(notification, payload) {
		if (notification === "CABI_DATA_RESPONSE") {
			console.log('cabi received message for data call');
			this.numBikes = payload.numBikes;
			this.numFreeSlots = payload.numFreeSlots;
			this.processCabi(null);
			this.scheduleUpdate(-1);
		}
	},



	// unload the results from cabi services
	processCabi: function(result) {
		console.log("ProcessCabi");
		console.log(result);

		// when done, redraw the module
		this.loaded = true;
		this.updateDom(this.config.animationSpeed);
	},


	// Override dom generator.
	getDom: function() {
		var wrapper = document.createElement("div");

		var cabi = document.createElement("div");
		cabi.className = "cabiContainer";
		
		var cabiIcon = document.createElement("img");
		cabiIcon.className = "badge";
		cabiIcon.src = "modules/derickson/cabi/cabi_small.png";

		var cabiText = document.createElement("span");

		if(this.loaded) {
			cabiText.innerHTML = this.config.stationName + ": " + this.numBikes + " Bikes and "+  this.numFreeSlots +" Free Bike Slots";
		} else {
			// Loading message
			cabiText.innerHTML = "Checking Cabi status ...";
		}
		

		cabi.appendChild(cabiIcon);
		cabi.appendChild(cabiText);
		
		wrapper.appendChild(cabi);
		return wrapper;
	}

});
