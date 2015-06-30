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

	backgroundMode: true,

	/**
	 * Device orientation, set to false to unlock
	 * @see https://github.com/gbenvenuti/cordova-plugin-screen-orientation
	 */
	deviceOrientation: {
		android: 'portrait-primary',
		ios: 'landscape-primary'
	},

	particles: {
		N: 30,
		effectiveParticleThreshold: 15,

		user: {
			defaultPose: {
				x: 0,
				y: 0,
				theta: 0
			},
			sdStep: 0.15,
			sdHeading: 0.1
		},

		init: {
			N: 500,
			sd: 1,
			randomN: 0,
			effectiveParticleThreshold: 250,
			maxVariance: 4
		}
	},

	pedometer: {
		stepSize: 0.6
	},

	landmarkConfig: {
		n: 2,
		txPower: -64,
		noise: 4,
		range: 20,

		distToFloor: 0.1,
		deviceHeight: 1.2
	},

	sensor: {
		motion: {
			frequency: 100
		},
		rssi: {
			kalman: {
				R: 0.008,
				Q: 4
			},
			minMeasurements: 10
		}
	},

	ble: {
		frequency: 100,
		devicePrefix: 'LowBeacon',

		toFriendlyName: (name) => {
			const parts = name.split('_');

			if (name.includes('2015')) {
				return parts[0];
			}
			else {
				return parts[0] + parts[1];
			}
		}
	},

	simulation: {
		xMax: 20,
		yMax: 20
	},

	replay: {
		showVisualisation: true,
		updateRate: 10,
		delayAlgorithm: true
	}
};
