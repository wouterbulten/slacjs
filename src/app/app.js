import ParticleSet from './models/particle-set';

/* global window */
/* global console */

window.app = {

	initialize: function() {
		'use strict';

		const particleSet = new ParticleSet(40, {x: 0, y: 0, theta: 0});

		particleSet.processObservation({id: 10, r: 20});

		console.log(particleSet);
	}
};