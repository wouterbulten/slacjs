import SimulatedUser from './simulation/user';
import FixedUser from './simulation/fixed-user';
import { SimulatedLandmarkSet } from './simulation/landmark';
import SlacController from './slac-controller';
import SimulationRenderder from './view/simulation-renderer';
import config from './config';

window.SlacENV = config.environment;

window.SlacApp = {

	particleSet: undefined,
	visualizer: undefined,
	sensor: undefined,

	user: undefined,
	renderer: undefined,
	controller: undefined,
	landmarks: undefined,

	initialize: function() {
		'use strict';

		//Update the initial pose with the true starting position
		config.particles.user.defaultPose = config.simulation.user;

		//Reset the device height as in the simulation everything is in the same plane
		config.landmarkConfig.distToFloor = 0;
		config.landmarkConfig.deviceHeight = 0;

		config.particles.user.sdStep = config.simulation.user.sdStep;
		config.particles.user.sdHeading = config.simulation.user.sdHeading;

		//Create a new controller
		this.controller = new SlacController(config);

		this.controller.start();

		//Bind renderer to controller
		this.controller.onUpdate((particles) => this.renderer.render(particles, this.user));

		this.user = new FixedUser(config.simulation.user, config.simulation.path);

		this.landmarks = new SimulatedLandmarkSet(
			20,
			{xRange: config.simulation.xMax, yRange: config.simulation.yMax},
			config.simulation.sensorUpdateRate,
			config.landmarkConfig,
			config.simulation.landmarks
		);

		//Create a renderer for the canvas view
		this.renderer = new SimulationRenderder(
			'slacjs-map',
			config.simulation.landmarks,
			config.simulation.xMax,
			config.simulation.yMax,
			0, 0
		);
	},

	step: function() {

		const success = this.user.walk();

		if (!success) {
			return;
		}

		//Simulated broadcasts
		this.landmarks.simulateBroadcasts(config.simulation.broadcastsPerStep, this.controller, this.user);

		//Transform to angle and distance
		//Simulate this by getting the control from the simulated user
		const {r, theta} = this.user.getLastControl();

		//As we simulate a user, and not the raw sensors we inject the data into the controller
		this.controller._stepSize = r;
		this.controller.heading = theta;

		//Run the private update function as we do not use the pedometer part of the controller
		this.controller._update();

		this._calculateLandmarkError();
	},

	/**
	 * Calculate the landmark error and show on screen
	 * @return {[type]} [description]
	 */
	_calculateLandmarkError() {

		const distArr = [];
		let landmarkErrorsStr = '';

		this.controller.particleSet.bestParticle().landmarks.forEach(function(l) {

			const trueL = config.simulation.landmarks[l.name];

			const dist = Math.sqrt(Math.pow(trueL.x - l.x, 2) + Math.pow(trueL.y - l.y, 2));

			distArr.push(dist);

			landmarkErrorsStr += l.name + ': ' + dist + '<br>';
		});

		if (distArr.length > 0) {
			$('.landmark-individual-error').html(landmarkErrorsStr);

			const avg = distArr.reduce(function(total, d) { return total + d; }, 0) / distArr.length;

			$('.landmark-error').html(avg);
		}
	}
};
