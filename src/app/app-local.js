import SimulatedUser from './simulation/user';
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

		const userStartX = config.simulation.xMax / 2;
		const userStartY = config.simulation.yMax / 2;

		//Move the user to the center of the screen
		config.particles.user.defaultPose.x = userStartX;
		config.particles.user.defaultPose.y = userStartY;

		//Reset the device height as in the simulation everything is in the same plane
		config.landmarkConfig.distToFloor = 0;
		config.landmarkConfig.deviceHeight = 0;

		//Create a new controller
		this.controller = new SlacController(config);

		this.controller.start();

		//Bind renderer to controller
		this.controller.onUpdate((particles) => this.renderer.render(particles, this.user));

		this.user = new SimulatedUser(
			{x: userStartX, y: userStartY, theta: 0.0},
			0.8,
			{xRange: config.simulation.xMax, yRange: config.simulation.yMax, padding: 5}
		);

		this.landmarks = new SimulatedLandmarkSet(
			20,
			{xRange: config.simulation.xMax, yRange: config.simulation.yMax},
			50,
			config.landmarkConfig
		);

		//Create a renderer for the canvas view
		this.renderer = new SimulationRenderder(
			'slacjs-map',
			this.landmarks.landmarks,
			config.simulation.xMax,
			config.simulation.yMax,
			0, 0
		);

		//Start broadcasting of the simulated landmarks
		//Broadcasts are sent to the sensor, the user object is used to find nearby landmarks
		this.landmarks.startBroadcast(this.controller, this.user);
	},

	step: function() {
		this.user.randomWalk();

		//Transform to angle and distance
		//Simulate this by getting the control from the simulated user
		const {r, theta} = this.user.getLastControl();

		//As we simulate a user, and not the raw sensors we inject the data into the controller
		this.controller._stepSize = r;
		this.controller.heading = theta;

		//Run the private update function as we do not use the pedometer part of the controller
		this.controller._update();
	}
};
