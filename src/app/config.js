/*
global module
*/

/**
 * General config for SLACjs
 * @type {Object}
 */
module.exports = {
	
	environment: 'development',

	particles: {
		N: 40,

		defaultPose: {
			x: 0,
			y: 0,
			theta: 0
		}
	},

	beacons: {
		n: 2,
		txPower: -12,
		noise: 4,
		range: 20
	},

	sensor: {
		frequency: 100
	}
};