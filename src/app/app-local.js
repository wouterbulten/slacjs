import SimulatedUser from './simulation/user';
import { SimulatedLandmarkSet } from './simulation/landmark';
import SlacController from './slac-controller';
import ReplayRenderer from './view/replay-renderer';
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

        //Create a new controller
        this.controller = new SlacController(config);

        this.controller.start();

		//Create a renderer for the canvas view
		this.renderer = new ReplayRenderer('slacjs-map', {});

        //Bind renderer to controller
		this.controller.onUpdate((particles) => this.renderer.render(particles));

		this.user = new SimulatedUser({x: 0, y: 0, theta: 0.0}, 0.8, {xRange: 20, yRange: 20, padding: 5});

		this.landmarks = new SimulatedLandmarkSet(20, {xRange: 20, yRange: 20}, 50, config.landmarkConfig);

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
