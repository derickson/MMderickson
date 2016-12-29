/* global Module */

/* Magic Mirror
 * Module: Wunderground
 *
 * based on the default/currentweather but getting data from wunderground
 *
 * By @derickson
 * based on similar module by Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */

Module.register("wunderground",{

	// Default module config.
	defaults: {
		location: "",  // required, put in config
		appid: "",     // required, put in config

		lang: config.language,

		updateInterval: 10 * 60 * 1000, // every 10 minutes
		animationSpeed: 1000,
		timeFormat: config.timeFormat,

		initialLoadDelay: 0, // 0 seconds delay	
		retryDelay: 2500,

		apiBase: 'http://api.wunderground.com/api/',

		metricURL: null,
		metricUsername: null,
		metricPassword: null
	},

	// Define required scripts.
	getScripts: function() {
		return ["moment.js"];
	},

	// Define required scripts.
	getStyles: function() {
		return [];
	},


	// Define start sequence.
	start: function() {
		Log.info("Starting module: " + this.name);

		// Set locale.
		moment.locale(config.language);

		this.temperature = null;
		this.weather = null;

		this.loaded = false;
		this.scheduleUpdate(this.config.initialLoadDelay);

		this.updateTimer = null;

	},

	// Override dom generator.
	getDom: function() {
		var wrapper = document.createElement("div");

		if (this.config.appid === "") {
			wrapper.innerHTML = "Please set the correct wunderground <i>appid</i> in the config for module: " + this.name + ".";
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		if (this.config.location === "") {
			wrapper.innerHTML = "Please set the wunderground <i>location</i> in the config for module: " + this.name + ".";
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		if (!this.loaded) {
			wrapper.innerHTML = this.translate('LOADING');
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		var small = document.createElement("div");
		small.className = "normal medium";


		var weatherS = document.createElement("span");
		weatherS.className = "dimmed";
		weatherS.innerHTML = " " + this.weather;
		small.appendChild(weatherS);


		var large = document.createElement("div");
		large.className = "large light";

		var temperature = document.createElement("span");
		temperature.className = "bright";
		temperature.innerHTML = " " + this.temperature + "&deg;";
		large.appendChild(temperature);

		wrapper.appendChild(small);
		wrapper.appendChild(large);
		return wrapper;
	},

	/* updateWeather()
	 * Requests new data from wunderground
	 * Calls processWeather on succesfull response.
	 */
	updateWeather: function() {

		var url = this.config.apiBase +  this.config.appid + '/conditions/q/' + this.config.location + '.json';

		var self = this;
		var retry = true;

		var weatherRequest = new XMLHttpRequest();
		weatherRequest.open("GET", url, true);
		weatherRequest.onreadystatechange = function() {
			if (this.readyState === 4) {
				if (this.status === 200) {
					self.processWeather(JSON.parse(this.response));
				} else if (this.status === 401) {
					self.config.appid = "";
					self.updateDom(self.config.animationSpeed);

					Log.error(self.name + ": Incorrect APPID.");
					retry = false;
				} else {
					Log.error(self.name + ": Could not load weather.");
				}

				if (retry) {
					self.scheduleUpdate((self.loaded) ? -1 : self.config.retryDelay);
				}
			}
		};
		weatherRequest.send();
	},


	/* processWeather(data)
	 * Uses the received data to set the various values.
	 *
	 * argument data object - Weather information received form openweather.org.
	 */
	processWeather: function(data) {
		var self = this;

		// Log.info('Wunderground data returned');
		// Log.info(data),
		
		// temperature in F
		this.temperature = this.roundValue(data.current_observation.temp_f);

		// a text blurb about the current weather
		this.weather = data.current_observation.weather;

		if(self.config.metricURL !== null) this.logMetric( "LOG_WUNDERGROUND", 
			{ temperature: parseFloat(this.temperature), weather: this.weather },
			self.config.metricURL, self.config.metricUsername, self.config.metricPassword);
		

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

	/* scheduleUpdate()
	 * Schedule next update.
	 *
	 * argument delay number - Milliseconds before next update. If empty, this.config.updateInterval is used.
	 */
	scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}

		var self = this;
		setTimeout(function() {
			self.updateWeather();
		}, nextLoad);
	},

	// @derickson - not currently used. I assume this is for if the incoming temperature is a string
	roundValue: function(temperature) {
		return parseFloat(temperature).toFixed(1);
	}


});
