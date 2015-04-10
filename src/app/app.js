import ParticleSet from './models/particle-set';

/* global window */
/* global console */
/* global math */

window.app = {

	initialize: function() {
		'use strict';

		const particleSet = new ParticleSet(40, {x: 0, y: 0, theta: 0});

		for (let i = 0; i < 1; i++) {

			particleSet.samplePose({})
					   .processObservation({id: 10, r: 20})
					   .resample()
					   .samplePose({})
					   .samplePose({});

			console.log(particleSet);
		}
	}
};