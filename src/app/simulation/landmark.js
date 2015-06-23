import { log, randn } from '../util/math';

export class SimulatedLandmarkSet {

	/**
	 * Create simulated landmarks
	 * @param  {Number} N              Amount of landmarks
	 * @param  {Number} options.xRange Max x
	 * @param  {Number} options.yRange Max y
	 * @param  {Number} updateRate     Refresh rate
	 * @param  {Object} landmarkConfig Landmark config
	 * @return {SimulatedLandmarkSet}
	 */
	constructor(N, {xRange, yRange}, updateRate, landmarkConfig) {
		this.landmarks = [];
		this.xRange = xRange;
		this.yRange = yRange;
		this.updateRate = updateRate;
		this.landmarkConfig = landmarkConfig;
		this.broadcastId = undefined;

		for (let i = 0; i < N; i++) {
			this.landmarks.push(this._randomLandmark('landmark-' + i));
		}
	}

	/**
	 * Start broadcasting landmark data
	 * @param  {SlacController} controller
	 * @param  {User} user
	 * @return {void}
	 */
	startBroadcast(controller, user) {
		this.broadcastId = window.setTimeout(() => this._broadCast(controller, user), this.updateRate);
	}

	/**
	 * Stop broadcast of landmark data
	 * @return {void}
	 */
	stopBroadCast() {
		if (this.broadcastId !== undefined) {
			window.clearTimeout(this.broadcastId);
		}
	}

	/**
	 * Set the update rate of the landmarks
	 * @param {float} updateRate
	 * @return {SimulatedLandmarkSet}
	 */
	setUpdateRate(updateRate) {
		this.updateRate = updateRate;

		return this;
	}

	/**
	 * Simulate RSSI measurements for all landmarks in range
	 * @param  {float} x
	 * @param  {float} y
	 * @return {Array}
	 */
	measurementsAtPoint(x, y) {
		const landmarks = this.landmarksInRange(x, y);
		const measurements = [];

		return landmarks.forEach((l) => measurements.push({uid: l.uid, rssi: l.rssiAt(x, y), name: l.name}));
	}

	/**
	 * Get a random measurement from a device in range
	 * @param  {float} x
	 * @param  {float} y
	 * @return {object}
	 */
	randomMeasurementAtPoint(x, y) {
		const landmarks = this.landmarksInRange(x, y);

		if (landmarks.length > 0) {
			const landmark = landmarks[Math.floor(Math.random() * landmarks.length)];

			return {uid: landmark.uid, rssi: landmark.rssiAt(x, y), name: landmark.name, address: landmark.address};
		}
	}

	/**
	 * Return all landmarks within range of a given x,y position
	 * @param  {float} x
	 * @param  {float} y
	 * @return {Array}
	 */
	landmarksInRange(x, y) {
		return this.landmarks.filter((l) => l.isInRange(x, y));
	}

	/**
	 * Create a landmark at a random position
	 * @param  {string} uid UID
	 * @return {Landmark}
	 */
	_randomLandmark(uid) {
		return new Landmark(uid, {
			x: Math.random() * this.xRange,
			y: Math.random() * this.yRange
		}, this.landmarkConfig);
	}

	/**
	 * Simulate a broadcast
	 *
	 * Sets a timeout to run this function again after a fixed amount of time
	 * @param  {SlacController} controller
	 * @param  {User} user
	 * @return {void}
	 */
	_broadCast(controller, user) {

		const m = this.randomMeasurementAtPoint(user.x, user.y);

		if (m !== undefined) {
			controller.addDeviceObservation(m.uid, m.rssi, m.name);
		}

		this.broadcastId = window.setTimeout(() => this._broadCast(controller, user), this.updateRate);
	}

	/**
	 * Get a landmark by its uid
	 * @param  {string} uid
	 * @return {Landmark}
	 */
	landmarkByUid(uid) {
		for (let i = 0; i < this.landmarks.length; i++) {
			if (this.landmarks[i].uid == uid) {
				return this.landmarks[i];
			}
		}
	}
}

export default SimulatedLandmarkSet;

class Landmark {
	/**
	 * Landmark
	 * @param  {string} uid             UID of the landmark
	 * @param  {float} options.x        Current x position
	 * @param  {float} options.y        Current y position
	 * @param  {int} options.n          Path loss exponent
	 * @param  {int} options.txPower    Transmit power
	 * @param  {float} options.noise    Noise level
	 * @param  {int} options.range      Range
	 * @return {Landmark}
	 */
	constructor(uid, {x, y}, {n, txPower, noise, range}) {
		this.uid = uid;
		this.x = x;
		this.y = y;
		this.landmarkRange = range;
		this.n = n;
		this.txPower = txPower;
		this.noise = noise;
		this.name = uid;
		this.address = 'addr:' + uid;
	}

	/**
	 * Returns true when a point x,y is in range
	 * @param  {float}  x
	 * @param  {float}  y
	 * @return {Boolean}
	 */
	isInRange(x, y) {
		return this.distanceTo(x, y) <= this.landmarkRange;
	}

	/**
	 * Distance from this landmark to a x,y point
	 * @param  {float} x
	 * @param  {float} y
	 * @return {float}
	 */
	distanceTo(x, y) {
		return Math.sqrt(Math.pow(this.x - x, 2) + Math.pow(this.y - y, 2));
	}

	/**
	 * RSSI value without noise at x,y point
	 * @param  {float} x
	 * @param  {float} y
	 * @return {float} RSSI value
	 */
	rssiAtRaw(x, y) {
		return this.txPower - ((10 * this.n) *  log(Math.max(this.distanceTo(x, y), 0.1), 10));
	}

	/**
	 * RSSI with noise at x,y point
	 * @param  {float} x
	 * @param  {float} y
	 * @return {float}
	 */
	rssiAt(x, y) {
		return this.rssiAtRaw(x, y) + randn(0, this.noise);
	}
}

export default Landmark;

/**
 * Convert RSSI to distance
 * @param  {float} rssi
 * @param  {object} landmarkConfig Should at least contain a txPower and n field
 * @return {float}
 */
export function rssiToDistance(rssi, landmarkConfig) {
	return Math.pow(10, (rssi - landmarkConfig.txPower) / (-10 * landmarkConfig.n));
}
