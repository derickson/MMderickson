/* global Module */

/* Magic Mirror
 * Module: Hello
 * 
 * an exact copy of the default/helloworld module to make sure I understand
 * how to build my own
 *
 * By @derickson 
 * based on work by Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */

Module.register("hello",{

	// Default module config.
	defaults: {
		text: "Dave says hello world"
	},

	// Override dom generator.
	getDom: function() {
		var wrapper = document.createElement("div");
		wrapper.innerHTML = this.config.text;
		return wrapper;
	}
});
