import MotionSensor from './device/motion-sensor';

window.SlacENV = 'debug';

/*
global $
 */

window.SlacApp = {

	motionSensor: undefined,

	uiElements: {},

	initialize: function() {
		'use strict';

		//Cache all UI elements
		this.uiElements = {
			indx: $('.motion-indicator-x'),
			indy: $('.motion-indicator-y'),
			indz: $('.motion-indicator-z'),
			indheading: $('.motion-indicator-heading'),

			deviceMotionEnabled: $('.device-motion'),
			deviceCompassEnabled: $('.device-compass')
		};

		this._startMotionSensing();
	},

	_motionUpdate(data) {
		this.uiElements.indx.html(data.x.toFixed(2));
		this.uiElements.indy.html(data.y.toFixed(2));
		this.uiElements.indz.html(data.z.toFixed(2));
		this.uiElements.indheading.html(data.heading.toFixed(2));
	},

	_startMotionSensing() {
		this.motionSensor = new MotionSensor();
		this.motionSensor.onChange((data) => this._motionUpdate(data));
		const enabled = this.motionSensor.startListening();

		if (enabled.accelerometer) {
			this.uiElements.deviceMotionEnabled.addClass('enabled');
		}

		if (enabled.compass) {
			this.uiElements.deviceCompassEnabled.addClass('enabled');
		}
	}
};