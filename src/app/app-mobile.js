import MotionSensor from './device/motion-sensor';
import ParticleSet from './models/particle-set';
import SimulatedUser from './simulation/user';
import { SimulatedLandmarkSet } from './simulation/landmark';
import Sensor from './models/sensor';
import ParticleRenderer from './view/particle-renderer';

window.SlacENV = 'debug';

/*
global $
 */

window.SlacApp = {

	motionSensor: undefined,

	uiElements: {},

	particleSet: undefined,
	visualizer: undefined,
	user: undefined,
	landmarks: undefined,
	sensor: undefined,

	landmarkConfig: {
		n: 2,
		txPower: -12,
		noise: 2,
		range: 20
	},

	step: function() {

		this.user.randomWalk();

		//Get accelerometer data
		// ...

		//Transform to angle and distance
		//Simulate this by getting the control from the simulated user
		const {r, theta} = this.user.getLastControl();

		//Sample a new pose for each particle in the set
		this.particleSet.samplePose({r, theta});

		//Get the latest observation
		const observations = this.sensor.getObservations();

		observations.forEach((obs) => this.particleSet.processObservation(obs));

		this.particleSet.resample();

		this.renderer.render(this.particleSet);
	},

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

		//this._startMotionSensing();

		this.particleSet = new ParticleSet(40, {x: 0, y: 0, theta: 0});
		this.user = new SimulatedUser({x: 0, y: 0, theta: 0.0}, 2, {xRange: 50, yRange: 50, padding: 5});

		//Add simulated data to the user object
		//this._addSimulatedData();

		this.landmarks = new SimulatedLandmarkSet(40, {xRange: 50, yRange: 50}, 50, this.landmarkConfig);
		this.sensor = new Sensor(this.landmarkConfig);

		//Start broadcasting of the simulated landmarks
		//Broadcasts are sent to the sensor, the user object is used to find nearby landmarks
		this.landmarks.startBroadcast(this.sensor, this.user);

		this.renderer = new ParticleRenderer('slacjs-map');
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
window.SlacApp.initialize();

setInterval(function() {

	window.SlacApp.step();
}, 1000);

