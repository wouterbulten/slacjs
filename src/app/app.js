import ParticleSet from './models/particle-set';
import Visualizer from './view/visualizer';
import SimulatedUser from './simulation/user';
import { SimulatedLandmarkSet } from './simulation/landmark';
import Sensor from './models/sensor';

/* global window */
/* global console */
/* global math */

window.app = {

	particleSet: undefined,
	visualizer: undefined,
	user: undefined,
	landmarks: undefined,
	sensor: undefined,

	landmarkConfig: {
		n: 2,
		txPower: -20, 
		noise: 2,
		range: 10
	},

	initialize: function() {
		'use strict';

		this.particleSet = new ParticleSet(4, {x: 0, y: 0, theta: 0});
		this.visualizer = new Visualizer('slac-map', 100, 100);
		this.user = new SimulatedUser({x: 0, y: 0, theta: 0.0}, 2, {xRange: 50, yRange: 50, padding: 5});
		this.landmarks = new SimulatedLandmarkSet(50, {xRange: 50, yRange: 50}, 50, this.landmarkConfig);
		this.sensor = new Sensor(this.landmarkConfig);

		//Start broadcasting of the simulated landmarks
		//Broadcasts are sent to the sensor, the user object is used to find nearby landmarks
		this.landmarks.startBroadcast(this.sensor, this.user)
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
		const obs = this.landmarks.randomMeasurementAtPoint(this.user.x, this.user.y);

		observations.forEach((obs) => this.particleSet.processObservation(obs));

		this.particleSet.resample();

		//Update the canvas
		this.visualizer.clearCanvas()
						.plotUserTrace(this.user, 'blue', this.landmarkConfig.range)
						.plotParticleSet(this.particleSet)
						.plotObjects(this.landmarks.landmarks)
						.plotLandmarkPredictions(this.particleSet.particles(), this.landmarks);
	}
};