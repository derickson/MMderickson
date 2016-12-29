/* global Module */

/* Magic Mirror
 * Module: Uber
 * 
 * Shows the time and surge pricing for UberX
 *
 * By @derickson
 * based on MagicMirror work by Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */

Module.register("uber",{

	// Default module config.
	defaults: {
		lat: null,
		long: null,
		product_id: null,
		client_id: null,
		uberServerToken: null,

		updateInterval: 10 * 60 * 1000, // every 10 minutes
		animationSpeed: 1000,
		timeFormat: config.timeFormat,

		initialLoadDelay: 0, // 0 seconds delay	
		retryDelay: 10000,

		metricURL: null,
		metricUsername: null,
		metricPassword: null
	},

	// Define required scripts.
	getScripts: function() {
		return ["moment.js", "https://code.jquery.com/jquery-2.2.3.min.js"];
	},

	// Define required styles.
	getStyles: function() {
		return ["uber.css"];
	},

	start: function() {
		Log.info("Starting module: " + this.name);

		// Set locale.
		moment.locale(config.language);

		// variables that will be loaded from service
		this.uberTime = null;
		this.uberSurge = null;

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
			self.updateUber();
		}, nextLoad);
	},

	// reach out to Uber dev API using REST
	updateUber: function() {
		

		var self = this;

		// first get the /estimates/time
		$.ajax({
		    url: "https://api.uber.com/v1/estimates/time",
		    headers: {
		        Authorization: "Token " + self.config.uberServerToken
		    },
		    data: {
		        start_latitude: self.config.lat,
		        start_longitude: self.config.long,
		        product_id: self.product_id
		    },
		    crossDomain : true,
		    success: function(resultTime) {

		    	// then get the /estimates/price for a 0 mile trip (to ge the surge pricing)
		    	$.ajax({
		    		url: "https://api.uber.com/v1/estimates/price",
		    		headers: {
				        Authorization: "Token " + self.config.uberServerToken
				    },
				    data: {
				        start_latitude: self.config.lat,
				        start_longitude: self.config.long,

				        end_latitude: self.config.lat,
				        end_longitude: self.config.long
				    },
				    crossDomain: true,
				    success: function(resultPrice) {

				    	// when we have both results, process the two results payloads
				    	self.processUber(resultTime, resultPrice);
				    	// schedule the next update
		        		self.scheduleUpdate(-1);
				    }
		    	});

		        
		    }
		  });
	},

	// unload the results from uber services
	processUber: function(resultTime, resultPrice) {
		var self = this;
		// console.log("ProcessUber");
		// console.log(resultTime);
		// console.log(resultPrice);

		// go through the time data to find the uberX product
		for (var i = 0, count = resultTime.times.length; i < count ; i++) {

			var rtime = resultTime.times[i];
			
			if(rtime.display_name === "uberX"){
				// convert estimated seconds to minutes
				this.uberTime = rtime.estimate / 60;
				break;
			}
		}

		// go through the price data to find the uberX product
		for( var i=0, count = resultPrice.prices.length; i< count; i++) {
			var rprice = resultPrice.prices[i];

			if(rprice.display_name === "uberX"){
				// grab the surge pricing
				this.uberSurge = rprice.surge_multiplier;
				break;
			}
		}

		if(self.config.metricURL !== null && this.uberTime != null && this.uberSurge != null) {
			// console.log("attempting to log uber 1");
			this.logMetric( "LOG_UBER", 
				{ uberTime: this.uberTime, uberSurge: this.uberSurge },
				self.config.metricURL, self.config.metricUsername, self.config.metricPassword);
		}
		

		// when done, redraw the module
		this.loaded = true;
		this.updateDom(this.config.animationSpeed);
	},

	logMetric: function( messageName, payload, url, username, password){
		var self = this;
		self.sendSocketNotification(messageName, {
			"url": url,
			"username": username,
			"password": password,
			"payload": payload
		});
	},


	// Override dom generator.
	getDom: function() {
		var wrapper = document.createElement("div");

		var uber = document.createElement("div");
		uber.className = "uberButton";
		
		var uberIcon = document.createElement("img");
		uberIcon.className = "badge";
		uberIcon.src = "modules/derickson/uber/UBER_API_Badges_1x_22px.png";

		var uberText = document.createElement("span");

		if(this.loaded) {
			var myText = "UberX in "+ this.uberTime +" min ";
			console.log("ubersurge: " + this.uberSurge);
			// only show the surge pricing if it is above 1.0
			if(typeof this.uberSurge !== "undefined" && this.uberSurge > 1.0){
				myText += " - " + this.uberSurge + "X surge pricing";
			}
			uberText.innerHTML = myText;
		} else {
			// Loading message
			uberText.innerHTML = "Checking Uber status ...";
		}
		

		uber.appendChild(uberIcon);
		uber.appendChild(uberText);
		
		wrapper.appendChild(uber);
		return wrapper;
	}

});
