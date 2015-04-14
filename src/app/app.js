import ParticleSet from './models/particle-set';
import Visualizer from './view/visualizer';
import SimulatedUser from './simulation/user';
import SimulatedLandmarkSet from './simulation/landmark';

/* global window */
/* global console */
/* global math */

window.app = {

	particleSet: undefined,
	visualizer: undefined,
	user: undefined,
	landmarks: undefined,

	initialize: function() {
		'use strict';

		this.particleSet = new ParticleSet(40, {x: 0, y: 0, theta: 0});
		this.visualizer = new Visualizer('slac-map', 50, 50);
		this.user = new SimulatedUser({x: 0, y: 0, theta: 0.5}, 2, {xRange: 25, yRange: 25, padding: 5});
		this.landmarks = new SimulatedLandmarkSet(50, 25, 25);
	},

	step: function() {

		this.user.randomWalk();

		//Get accelerometer data
		// ...

		//Transform to angle and distance
		const r = 1;
		const theta = 1;

		//Sample a new pose for each particle in the set
		this.particleSet.samplePose(r, theta);

		//Get the latest observation
		const obs = {id: 10, r: 20};

		//Update the EKF and resmample
		this.particleSet.processObservation(obs)
						.resample();

		//Update the canvas
		this.visualizer.clearCanvas()
						.plotUserTrace(this.user, 'blue')
						.plotParticleSet(this.particleSet)
						.plotObjects(this.landmarks.landmarks);
	}
};