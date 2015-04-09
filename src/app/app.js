import User from './models/user';

/* global window */
/* global console */

window.app = {

	initialize: function() {
		'use strict';

		const user = new User({x: 0, y: 0, theta: 0});

		console.log(user);

		user.moveUser(10, 0.25 * Math.PI);

		console.log(user);
	}
};