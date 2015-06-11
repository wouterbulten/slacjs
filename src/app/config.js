/*
global module
*/

/**
 * General config for SLACjs
 * @type {Object}
 */
module.exports = {

	environment: 'development',

	exportData: true,

	/**
	 * Device orientation, set to false to unlock
	 * @see https://github.com/gbenvenuti/cordova-plugin-screen-orientation
	 */
	deviceOrientation: {
		android: 'portrait',
		ios: 'landscape'
	},

	particles: {
		N: 40,

		defaultPose: {
			x: 0,
			y: 0,
			theta: 0
		}
	},

	pedometer: {
		stepSize: 0.4
	},
	
	beacons: {
		n: 2,
		txPower: -60,
		noise: 4,
		range: 20
	},

	sensor: {
		frequency: 100
	},

	ble: {
		frequency: 100,
		devicePrefix: 'DoBeacon_upstair'
	}
};
