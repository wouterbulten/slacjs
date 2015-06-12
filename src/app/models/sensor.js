import KalmanFilter from '../util/kalman';

class Sensor {

	/**
	 * Sensor
	 * @param  {int} options.n
	 * @param  {int} options.txPower
	 * @param  {int} options.noise
	 * @param  {int} options.range
	 * @param  {Number} options.R       Process noise
	 * @param  {Number} options.Q       Measurement noise
	 * @param  {Number} minMeasurements Minimum amount of measurements before we return a rssi value
	 * @return {Sensor}
	 */
	constructor({n, txPower, noise, range}, {R = 0.008, Q = undefined} = {}, minMeasurements = 10) {

		this.landmarks = new Map();
		this.landmarkConfig = {n, txPower, noise, range};

		if (Q === undefined) {
			Q = noise;
		}

		this.R = R;
		this.Q = Q;

		this.minMeasurements = minMeasurements;
	}

	/**
	 * Process a new observation
	 * @param {String} uid
	 * @param {Number} rssi
	 * @param {String} name
	 */
	addObservation(uid, rssi, name) {

		//Check whether the rssi value is valid
		if(rssi > 0) {
			return;
		}

		if (this.landmarks.has(uid)) {
			this._updateLandmark(uid, rssi);
		}
		else {
			this._registerLandmark(uid, rssi, name);
		}
	}

	/**
	 * Get all observations since the last request
	 *
	 * @return {Array}
	 */
	getObservations() {
		const observedLandmarks = [];

		//Get all the landmarks that have been upated during the current iteration
		this.landmarks.forEach((l, uid) => {
			if (l.changed && l.measurements > this.minMeasurements) {
				const rssi = l.filter.lastMeasurement();

				observedLandmarks.push({uid, r: this._rssiToDistance(rssi), name: l.name});
			}

			l.changed = false;
		});

		return observedLandmarks;
	}

	/**
	 * Update a landmark given a new rssi observation
	 * @param  {float} uid
	 * @param  {float} rssi
	 * @return {void}
	 */
	_updateLandmark(uid, rssi) {

		const landmark = this.landmarks.get(uid);

		landmark.filter.filter(rssi);
		landmark.measurements++;
		landmark.changed = true;
	}

	/**
	 * Add a new landmark to the interal list
	 * @param  {string} uid  Landanme uid
	 * @param  {float} rssi  Current RSSI value
	 * @return {void}
	 */
	_registerLandmark(uid, rssi, name) {

		console.log('[SLACjs/sensor] New landmark found with uid ' + uid + ' and name ' + name);

		const filter = new KalmanFilter({R: this.R, Q: this.Q});
		filter.filter(rssi);

		this.landmarks.set(uid, {
			uid,
			changed: true,
			name,
			filter,
			measurements: 1
		});
	}

	/**
	 * Convert RSSI to a distance estimate
	 * @param  {float} rssi
	 * @return {float}
	 */
	_rssiToDistance(rssi) {
		return Math.pow(10, (rssi - this.landmarkConfig.txPower) / (-10 * this.landmarkConfig.n));
	}
}

export default Sensor;
