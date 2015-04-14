import ParticleSet from './models/particle-set';
import LinkedList from './util/linked-list';
import Visualizer from './view/visualizer';

/* global window */
/* global console */
/* global math */

window.app = {

	initialize: function() {
		'use strict';

		const particleSet = new ParticleSet(40, {x: 0, y: 0, theta: 0});

		const visualizer = new Visualizer('slac-map', 50, 50, 2);

		for (let i = 0; i < 10; i++) {

			particleSet.samplePose({})
					   .processObservation({id: 10, r: 20})
					   .resample()

			console.log(particleSet);

			visualizer.clearCanvas().plotParticleSet(particleSet);
		}


	}
};