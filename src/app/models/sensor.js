import KalmanFilter from '../util/kalman';
import config from '../config';

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
	constructor({n, txPower, noise, range, deviceHeight, distToFloor}, {R = 0.008, Q = undefined} = {}, minMeasurements = 10) {

		this.landmarks = new Map();
		this.landmarkConfig = {n, txPower, noise, range, deviceHeight, distToFloor};

		if (Q === undefined) {
			Q = noise;
		}

		this.R = R;
		this.Q = Q;

		this.minMeasurements = minMeasurements;

		this.hasMoved = undefined;
		this.eventListener = undefined;
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

			if (this._hasMoved(uid, name)) {
				this._moveLandmark(uid, rssi, name);
			}
			else {
				this._updateLandmark(uid, rssi);
			}
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

				//Get the filtered rssi value
				const rssi = l.filter.lastMeasurement();

				//Convert name to friendly name
				//@todo remove direct dependency on config
				const name = config.ble.toFriendlyName(l.name);

				observedLandmarks.push({
					uid,
					r: this._rssiToDistance(rssi),
					name,
					moved: l.moved
				});
			}

			//Reset all flags
			l.changed = false;
			l.moved = false;
		});

		return observedLandmarks;
	}

	/**
	 * Callback that returns true when a beacon has moved
	 * @param  {Function} callback
	 * @return {Sensor}
	 */
	hasMovedIf(callback) {
		this.hasMoved = callback;

		return this;
	}

	/**
	 * Set a function to call when an event occurs
	 * @param {Function} callback
	 */
	setEventListener(callback) {
		this.eventListener = callback;

		return this;
	}

	/**
	 * Update a landmark given a new rssi observation
	 * @param  {float} uid
	 * @param  {float} rssi
	 * @return {void}
	 */
	_updateLandmark(uid, rssi) {

		const landmark = this.landmarks.get(uid);

		this._event(uid, landmark.name, 'update', 'Landmark updated');

		landmark.filter.filter(rssi);
		landmark.measurements++;
		landmark.changed = true;
	}

	/**
	 * Add a new landmark to the interal list
	 * @param  {string} uid  Landmark name uid
	 * @param  {float} rssi  Current RSSI value
	 * @param  {String} name Landmark name
	 * @param  {Boolean} moved
	 * @return {void}
	 */
	_registerLandmark(uid, rssi, name, moved = false) {

		if (!moved) {
			this._event(uid, name, 'new', `New landmark found with name ${name}`);
		}

		const filter = new KalmanFilter({R: this.R, Q: this.Q});
		filter.filter(rssi);

		this.landmarks.set(uid, {
			uid,
			changed: true,
			name,
			filter,
			measurements: 1,
			moved
		});
	}

	/**
	 * Check whether a landmark has moved
	 * @param  {String}  uid
	 * @param  {String}  name
	 * @return {Boolean}
	 */
	_hasMoved(uid, name) {
		const landmark = this.landmarks.get(uid);

		return this.hasMoved !== undefined && this.hasMoved(
			{uid, name},
			{uid: landmark.uid, name: landmark.name}
		);
	}

	/**
	 * Move a landmark by ressetting and setting the moved flag
	 * @param  {string} uid  Landmark name uid
	 * @param  {float} rssi  Current RSSI value
	 * @param  {String} name Landmark name
	 * @return {void}
	 */
	_moveLandmark(uid, rssi, name) {

		this._event(uid, name, 'moved', 'Landmark has moved');

		this._registerLandmark(uid, rssi, name, true);
	}

	/**
	 * Convert RSSI to a distance estimate
	 *
	 * Compensates for the difference between the mobile device and the beacon height
	 * @param  {float} rssi
	 * @return {float}
	 */
	_rssiToDistance(rssi) {

		const deltaHeight = this.landmarkConfig.deviceHeight - this.landmarkConfig.distToFloor;
		const estimation = Math.pow(10, (rssi - this.landmarkConfig.txPower) / (-10 * this.landmarkConfig.n));

		return Math.sqrt((estimation * estimation) - (deltaHeight * deltaHeight));
	}

	/**
	 * Process a sensor event
	 * @param  {String} uid
	 * @param  {String} event
	 * @param  {String} msg
	 * @return {void}
	 */
	_event(uid, name, event, msg) {
		if(this.eventListener !== undefined) {
			this.eventListener(uid, name, event, msg);
		}
	}
}

export default Sensor;
