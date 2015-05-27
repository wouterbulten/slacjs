import MotionSensor from './device/motion-sensor';
import ParticleSet from './models/particle-set';
import SimulatedUser from './simulation/user';
import { SimulatedLandmarkSet } from './simulation/landmark';
import Sensor from './models/sensor';
import ParticleRenderer from './view/particle-renderer';
import Pedometer from './device/pedometer';
import { degreeToRadian, rotationToLocalNorth } from './util/coordinate-system';

window.SlacENV = 'debug';

/*
global $
 */

window.SlacApp = {

	motionSensor: undefined,
	pedometer: undefined,

	stepCount: 0,

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

		console.log('[SLACjs] step');
this.pedometer.stepCount += 1
		//Only udpate if the user has walked
		if (this.stepCount == this.pedometer.stepCount) {
			console.log('[SLACjs] User is not moving');
			return false;
		}

		console.log('[SLACjs] User moved, running SLAM');

		//Get difference in amount of steps
		const steps = this.pedometer.stepCount - this.stepCount;
		this.stepCount = this.pedometer.stepCount;

		//Convert step count to distance measure
		//@todo Make this variable
		const dist = steps * 0.8;

		//Get current heading
		const heading = degreeToRadian(this.motionSensor.heading);

		console.log(`[SLACjs] User moved, dist (m): ${dist}, heading (rad): ${heading}`);

		//Sample a new pose for each particle in the set
		this.particleSet.samplePose({r: dist, theta: heading});

		//Get the latest observation
		const observations = this.sensor.getObservations();

		observations.forEach((obs) => this.particleSet.processObservation(obs));

		this.particleSet.resample();

		this.renderer.render(this.particleSet);

		return true;
	},

	initialize: function() {
		'use strict';

		console.log('[SLACjs] Initialising..');

		//Cache all UI elements
		this.uiElements = {
			indx: $('.motion-indicator-x'),
			indy: $('.motion-indicator-y'),
			indz: $('.motion-indicator-z'),
			indheading: $('.motion-indicator-heading'),
			stepCount: $('.motion-step-count'),
			map: $('#slacjs-map'),

			deviceMotionEnabled: $('.device-motion'),
			deviceCompassEnabled: $('.device-compass')
		};

		this.particleSet = new ParticleSet(40, {x: 0, y: 0, theta: 0});
		this.user = new SimulatedUser({x: 0, y: 0, theta: 0.0}, 2, {xRange: 50, yRange: 50, padding: 5});

		this.landmarks = new SimulatedLandmarkSet(40, {xRange: 50, yRange: 50}, 50, this.landmarkConfig);
		this.sensor = new Sensor(this.landmarkConfig);

		//Start broadcasting of the simulated landmarks
		//Broadcasts are sent to the sensor, the user object is used to find nearby landmarks
		this.landmarks.startBroadcast(this.sensor, this.user);

		this.renderer = new ParticleRenderer('slacjs-map');

		this._startMotionSensing();

		//Start the slam loop
		this.loop();
	},

	/**
	 * Start the SLAC loop
	 * @param  {Number} timeout Number of miliseconds between updates
	 * @return {SlacApp}
	 */
	loop: function(timeout = 500) {

		setTimeout(() => {

			console.log('[SLACjs] Running loop');

			var stepped = this.step();

			if (stepped) {
				//We performed a step, run the next step
				this.loop(100);
			}
			else {
				//Wait a bit befor running the next step
				this.loop(250);
			}
		}, timeout);

		return this;
	},

	/**
	 * Start the motion sensing
	 * @return {[type]} [description]
	 */
	_startMotionSensing() {

		//Create a new motion sensor object that listens for updates
		this.motionSensor = new MotionSensor();

		//Create new pedometer to count steps
		this.pedometer = new Pedometer(this.motionSensor.frequency);

		//Register a listener, this udpates the view and runs the pedometer
		this.motionSensor.onChange((data) => this._motionUpdate(data));
		const enabled = this.motionSensor.startListening();

		//Update the view to indicate all sensors are working
		if (enabled.accelerometer) {
			this.uiElements.deviceMotionEnabled.addClass('enabled');
		}

		if (enabled.compass) {
			this.uiElements.deviceCompassEnabled.addClass('enabled');
		}
	},

	_motionUpdate(data) {

		//Update the view
		this.uiElements.indx.html(data.x.toFixed(2));
		this.uiElements.indy.html(data.y.toFixed(2));
		this.uiElements.indz.html(data.z.toFixed(2));
		this.uiElements.indheading.html(data.heading.toFixed(2));

		//Find smallest rotation
		const degree = rotationToLocalNorth(data.heading);

		this.uiElements.map.css({
			'-webkit-transform' : 'rotate('+ degree +'deg)',
             '-moz-transform' : 'rotate('+ degree +'deg)',
             '-ms-transform' : 'rotate('+ degree +'deg)',
             'transform' : 'rotate('+ degree +'deg)'
        });

		//Update the pedometer
		this.pedometer.processMeasurement(data.x, data.y, data.z);

		this.uiElements.stepCount.html(this.pedometer.stepCount);
	}

};

window.SlacApp.initialize();
