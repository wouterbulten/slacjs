import ParticleSet from './models/particle-set';
import Visualizer from './view/visualizer';
import SimulatedUser from './simulation/user';

/* global window */
/* global console */
/* global math */

window.app = {

	particleSet: undefined,
	visualizer: undefined,
	user: undefined,

	initialize: function() {
		'use strict';

		this.particleSet = new ParticleSet(40, {x: 0, y: 0, theta: 0});
		this.visualizer = new Visualizer('slac-map', 50, 50);
		this.user = new SimulatedUser({x: 0, y: 0, theta: 0.5}, 2, {xRange: 25, yRange: 25, padding: 5});
	},

	step: function() {

		this.user.randomWalk();

		this.particleSet.samplePose({})
				   		.processObservation({id: 10, r: 20})
				   		.resample()

		this.visualizer.clearCanvas()
				  		.plotUserTrace(this.user, 'blue')
				  		.plotParticleSet(this.particleSet);
	}
};