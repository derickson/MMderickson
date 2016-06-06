/* global Module */

/* Magic Mirror
 * Module: WundergroundForecast
 *
 * a weather forecast module pulling data from wunderground
 * 
 * by @derickson
 * based on the module weatherforecast by Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */

Module.register("wundergroundForecast",{

	// Default module config.
	defaults: {
		location: "",  // required, put in config
		appid: "",     // required, put in config

		lang: config.language,

		maxNumberOfDays: 7,

		updateInterval: 30 * 60 * 1000, // every 10 minutes
		animationSpeed: 1000,
		timeFormat: config.timeFormat,
		lang: config.language,
		fade: true,
		fadePoint: 0.25, // Start on 1/4th of the list.

		initialLoadDelay: 2500, // 0 seconds delay	
		retryDelay: 2500,

		apiBase: 'http://api.wunderground.com/api/'
	},


	// Define required scripts.
	getScripts: function() {
		return ["moment.js"];
	},

	// Define required scripts.
	getStyles: function() {
		return ["wundergroundForecast.css"];
	},


	// Define start sequence.
	start: function() {
		Log.info("Starting module: " + this.name);

		// Set locale.
		moment.locale(config.language);

		this.forecast = [];
		this.loaded = false;
		this.scheduleUpdate(this.config.initialLoadDelay);

		this.updateTimer = null;
	},

	// Override dom generator.
	getDom: function() {
		var wrapper = document.createElement("div");

		if (this.config.appid === "") {
			wrapper.innerHTML = "Please set the correct openweather <i>appid</i> in the config for module: " + this.name + ".";
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		if (this.config.location === "") {
			wrapper.innerHTML = "Please set the openweather <i>location</i> in the config for module: " + this.name + ".";
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		if (!this.loaded) {
			wrapper.innerHTML = this.translate('LOADING');
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		var table = document.createElement("table");
		table.className = "small";

		for (var f in this.forecast) {
			var forecast = this.forecast[f];

			var row = document.createElement("tr");
			table.appendChild(row);

			var dayCell = document.createElement("td");
			dayCell.className = "day";
			dayCell.innerHTML = forecast.day;
			row.appendChild(dayCell);

			// var iconCell = document.createElement("td");
			// iconCell.className = "bright weather-icon";
			// row.appendChild(iconCell);

			// var icon = document.createElement("span");
			// icon.className = forecast.icon;
			// iconCell.appendChild(icon);

			var conditionCell = document.createElement("td");
			conditionCell.innerHTML = forecast.condition;
			conditionCell.className = "align-right condition";
			row.appendChild(conditionCell);

			var maxTempCell = document.createElement("td");
			maxTempCell.innerHTML = forecast.maxTemp;
			maxTempCell.className = "align-right bright max-temp";
			row.appendChild(maxTempCell);

			var minTempCell = document.createElement("td");
			minTempCell.innerHTML = forecast.minTemp;
			minTempCell.className = "align-right min-temp";
			row.appendChild(minTempCell);


			if (this.config.fade && this.config.fadePoint < 1) {
				if (this.config.fadePoint < 0) {
					this.config.fadePoint = 0;
				}
				var startingPoint = this.forecast.length * this.config.fadePoint;
				var steps = this.forecast.length - startingPoint;
				if (f >= startingPoint) {
					var currentStep = f - startingPoint;
					row.style.opacity = 1 - (1 / steps * currentStep);
				}
			}

		}

		return table;
	},

	/* updateWeather()
	 * Requests new data from wunderground
	 * Calls processWeather on succesfull response.
	 */
	updateWeather: function() {
		var url = this.config.apiBase +  this.config.appid + '/forecast10day/q/' + this.config.location + '.json';

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

		this.forecast = [];
		for (var i = 0, count = data.forecast.simpleforecast.forecastday.length; i < count && i < this.config.maxNumberOfDays ; i++) {

			var forecast = data.forecast.simpleforecast.forecastday[i];
			this.forecast.push({

				day: forecast.date.weekday_short,
				// icon: this.config.iconTable[forecast.weather[0].icon],
				maxTemp: this.roundValue(forecast.high.fahrenheit),
				minTemp: this.roundValue(forecast.low.fahrenheit),
				condition: forecast.conditions

			});
		}

		//Log.log(this.forecast);

		this.loaded = true;
		this.updateDom(this.config.animationSpeed);
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
		clearTimeout(this.updateTimer);
		this.updateTimer = setTimeout(function() {
			self.updateWeather();
		}, nextLoad);
	},


	/* function(temperature)
	 * Rounds a temperature to 1 decimal.
	 *
	 * argument temperature number - Temperature.
	 *
	 * return number - Rounded Temperature.
	 */
	roundValue: function(temperature) {
		return parseFloat(temperature).toFixed(1);
	}
});
