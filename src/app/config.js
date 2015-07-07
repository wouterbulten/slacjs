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

			//Can be overriden in specific environments, e.g. simulation
			sdStep: 0.15,
			sdHeading: 0.1
		},

		init: {
			N: 200,
			sd: 1,
			randomN: 0,
			effectiveParticleThreshold: 75,
			maxVariance: 4
		}
	},

	pedometer: {
		stepSize: 0.5
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
			minMeasurements: 30
		}
	},

	ble: {
		frequency: 10,
		devicePrefix: 'LowBeacon',

		toFriendlyName: (name) => {
			const parts = name.split('_');

			if (parts.length === 1) {
				return parts[0];
			}
			else if (name.includes('2015')) {
				return parts[0];
			}
			else {
				return parts[0] + parts[1];
			}
		}
	},

	simulation: {
		xMax: 10,
		yMax: 10,
		sensorUpdateRate: 50,
		broadcastsPerStep: 20,

		landmarks: {
			'LowBeacon1': {
				x: 3.76,
				y: 7.87
			},
			'LowBeacon2': {
				x: 7.36,
				y: 7.87
			},
			'LowBeacon3': {
				x: 7.13,
				y: 0
			},
			'LowBeacon4': {
				x: 4.13,
				y: 0
			},
			'LowBeacon5': {
				x: 1.13,
				y: 0
			},
			'LowBeacon6': {
				x: 1.93,
				y: 1.3
			},
			'LowBeacon7': {
				x: 3.94,
				y: 5.42
			}
		},

		user: {
			x: 2.46,
			y: 3.8,
			theta: 0,
			sdStep: 0.15,
			sdHeading: 0.1
		},

		path: [
			{r: 0.5, theta: 0},
			{r: 0.5, theta: 0},
			{r: 0.5, theta: 0},
			{r: 0.5, theta: 0},
			{r: 0.5, theta: 0},
			{r: 0.5, theta: 0},
			{r: 0.5, theta: 0},
			{r: 0.5, theta: 0},
			{r: 0.5, theta: 0},
			{r: 0.5, theta: 0},
			{r: 0.5, theta: 0.5 * Math.PI},
			{r: 0.5, theta: 0.5 * Math.PI},
			{r: 0.5, theta: 0.5 * Math.PI},
			{r: 0.5, theta: 0.5 * Math.PI},
			{r: 0.5, theta: 0.5 * Math.PI},
			{r: 0.5, theta: 0.5 * Math.PI},
			{r: 0.5, theta: 0.5 * Math.PI},
			{r: 0.5, theta: -1 * Math.PI},
			{r: 0.5, theta: -1 * Math.PI},
			{r: 0.5, theta: -1 * Math.PI},
			{r: 0.5, theta: -1 * Math.PI},
			{r: 0.5, theta: -1 * Math.PI},
			{r: 0.5, theta: -1 * Math.PI},
			{r: 0.5, theta: -1 * Math.PI},
			{r: 0.5, theta: -0.5 * Math.PI},
			{r: 0.5, theta: -0.5 * Math.PI},
			{r: 0.5, theta: -0.5 * Math.PI},
			{r: 0.5, theta: -0.5 * Math.PI},
			{r: 0.5, theta: -0.5 * Math.PI},
			{r: 0.5, theta: -0.5 * Math.PI},
			{r: 0.5, theta: -0.5 * Math.PI},
			{r: 0.5, theta: -0.5 * Math.PI},
			{r: 0.5, theta: 0},

			{r: 0.5, theta: 0.5 * Math.PI},
			{r: 0.5, theta: 0.5 * Math.PI},
			{r: 0.5, theta: 0.5 * Math.PI},
			{r: 0.5, theta: 0.5 * Math.PI},
			{r: 0.5, theta: 0.5 * Math.PI},
			{r: 0.5, theta: 0.5 * Math.PI},
			{r: 0.5, theta: 0.5 * Math.PI},
			{r: 0.5, theta: 0},
			{r: 0.5, theta: 0},
			{r: 0.5, theta: 0},
			{r: 0.5, theta: 0},
			{r: 0.5, theta: 0},
			{r: 0.5, theta: 0},
			{r: 0.5, theta: 0},
			{r: 0.5, theta: -0.5 * Math.PI},
			{r: 0.5, theta: -0.5 * Math.PI},
			{r: 0.5, theta: -0.5 * Math.PI},
			{r: 0.5, theta: -0.5 * Math.PI},
			{r: 0.5, theta: -0.5 * Math.PI},
			{r: 0.5, theta: -0.5 * Math.PI},
			{r: 0.5, theta: -0.5 * Math.PI},
			{r: 0.5, theta: -0.5 * Math.PI},
			{r: 0.5, theta: -0.5 * Math.PI},
			{r: 0.5, theta: -1 * Math.PI},
			{r: 0.5, theta: -1 * Math.PI},
			{r: 0.5, theta: -1 * Math.PI},
			{r: 0.5, theta: -1 * Math.PI},
			{r: 0.5, theta: -1 * Math.PI},
			{r: 0.5, theta: -1 * Math.PI},
			{r: 0.5, theta: -1 * Math.PI},
			{r: 0.5, theta: -1 * Math.PI},
			{r: 0.5, theta: -1 * Math.PI},
			{r: 0.5, theta: -1 * Math.PI}
		]
	},

	replay: {
		showVisualisation: true,
		updateRate: 10,
		delayAlgorithm: true
	}
};
