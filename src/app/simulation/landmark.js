import { log, randn } from '../util/math';

export class SimulatedLandmarkSet {

	constructor(N, {xRange, yRange}, updateRate, landmarkConfig) {
		this.landmarks = [];
		this.xRange = xRange;
		this.yRange = yRange;
		this.updateRate = updateRate;
		this.landmarkConfig = landmarkConfig;

		for (let i = 0; i < N; i++) {
			this.landmarks.push(this._randomLandmark('landmark-' + i));
		}
	}

	startBroadcast(sensor, user) {
		window.setTimeout(() => this._broadCast(sensor, user), this.updateRate);
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

		return landmarks.forEach((l) => measurements.push({uid: l.uid, rssi: l.rssiAt(x, y)}));
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
			
			return {uid: landmark.uid, rssi: landmark.rssiAt(x, y)};
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
			x: Math.random() * (2 * this.xRange) - this.xRange,
			y: Math.random() * (2 * this.yRange) - this.yRange
		}, this.landmarkConfig);
	}

	_broadCast(sensor, user) {
		
		const measurement = this.randomMeasurementAtPoint(user.x, user.y);
		
		if (measurement !== undefined) {
			if(measurement.uid === undefined) {
				console.error(measurement)
			}
			sensor.addObservation(measurement);
		}

		window.setTimeout(() => this._broadCast(sensor, user), this.updateRate);
	}
}

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
		return -(10 * this.n) *  log(Math.max(this.distanceTo(x, y), 0.1), 10) + this.txPower;
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

/**
 * Convert RSSI to distance
 * @param  {float} rssi
 * @param  {object} landmarkConfig Should at least contain a txPower and n field
 * @return {float}
 */
export function rssiToDistance(rssi, landmarkConfig) {
	return Math.pow(10, (rssi - landmarkConfig.txPower) / (-10 * landmarkConfig.n));
}