class Sensor {
	/**
	 * Sensor
	 * @param  {int} options.n
	 * @param  {int} options.txPower
	 * @param  {int} options.noise
	 * @param  {int} options.range
	 * @return {Senser}
	 */
	constructor({n, txPower, noise, range}) {
		this.landmarks = new Map();
		this.iteration = 0;
		this.landmarkConfig = {n, txPower, noise, range};
	}

	/**
	 * Process a new observation
	 * @param {string} options.uid
	 * @param {float} options.rssi
	 */
	addObservation({uid, rssi}) {
		if (this.landmarks.has(uid)) {
			this._updateLandmark(uid, rssi);
		}
		else {
			this._registerLandmark(uid, rssi);
		}
	}

	/**
	 * Get all averaged observations since the last request
	 *
	 * Updates the interal iteration counter
	 * @return {Array}
	 */
	getObservations() {
		const observedLandmarks = [];

		//Get all the landmarks that have been upated during the current iteration
		this.landmarks.forEach((l, id) => {
			if (l.iteration === this.iteration) {
				observedLandmarks.push({id, r: this._rssiToDistance(l.rssi)});
			}
		});

		this.iteration++;

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
		const alpha = this._computeAlpha(rssi, landmark.iteration);

		landmark.rssi = (rssi * alpha) + (landmark.rssi * (1 - alpha));
		landmark.iteration = this.iteration;
	}

	/**
	 * Add a new landmark to the interal list
	 * @param  {string} uid  Landanme uid
	 * @param  {float} rssi  Current RSSI value
	 * @return {void}
	 */
	_registerLandmark(uid, rssi) {
		this.landmarks.set(uid, {
			uid: uid,
			rssi: rssi,
			iteration: this.iteration
		});
	}

	/**
	 * Compute the alpha for the exponential weigthed average
	 * @param  {float} rssi
	 * @param  {int} previousIteration
	 * @return {float}
	 */
	_computeAlpha(rssi, previousIteration) {
		//See http://www.hindawi.com/journals/ijdsn/aa/195297/
		//Alpha is based on the RSSI (larger values means larger alpha)
		//The difference in time defines the maximum value of alpha, this increases
		//with the time between the previous observation.
		//
		//@todo Currently we only use the timediff
		const timeDiff = Math.max(this.iteration - previousIteration, 1);

		const timeFactor = 1 - (1 / (Math.pow(timeDiff, 1.5) + 1));
		const rssiFactor = Math.min(1, 1 - (0.5 * ((-10 - rssi) / 60)));

		return timeFactor;
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