class MotionSensor {

	/**
	 * Motion sensor
	* @param {Number} frequency Update rate of sensor
	 * @param {Boolean} enableCompassUpdate Set to true to be notified of compass updates
	 * @param {Boolean} enableAccUpdate Set to true to be notified of accelerometer updates
	 * @return {MotionSensor}
	 */
	constructor(frequency = 100, enableCompassUpdate = false, enableAccUpdate = true, compassFilter = undefined) {

		this.accelerometerId = undefined;
		this.compassId = undefined;
		this.frequency = frequency;
		this.listenerOptions = {frequency};
		this.compassOptions = {frequency, filter: compassFilter};
		this.listeners = [];

		this.enableAccUpdate = enableAccUpdate;
		this.enableCompassUpdate = enableCompassUpdate;

		this.x = 0.0;
		this.y = 0.0;
		this.z = 0.0;
		this.heading = 0.0;
	}

	/**
	 * Start listening for changes
	 * @return {Boolean} True when listeners have been started
	 */
	startListening() {
		if (this.accelerometerId === undefined) {
			this.accelerometerId = navigator.accelerometer.watchAcceleration(
				(data) => this._updateAccelerometer(data),
				(error) => this._onError(error),
				this.listenerOptions
			);
		}

		if (this.compassId === undefined) {
			this.compassId = navigator.compass.watchHeading(
				(data) => this._updateCompass(data),
				(error)	=>this._onError(error),
				this.compassOptions
			);
		}

		return {compass: this.compassId !== undefined, accelerometer: this.accelerometerId !== undefined};
	}

	/**
	 * Add a new listener function
	 * @param {Function} callback
	 */
	onChange(callback) {
		this.listeners.push(callback);
	}

	/**
	 * Process accelerometer data
	 * @param  {object} acceleration x,y,z
	 * @return {void}
	 */
	_updateAccelerometer(acceleration) {
		this.x = acceleration.x;
		this.y = acceleration.y;
		this.z = acceleration.z;

		if (this.enableAccUpdate) {
			this._changed();
		}
	}

	/**
	 * Process compass data
	 * @param  {object} heading
	 * @return {void}
	 */
	_updateCompass(heading) {
		this.heading = heading.magneticHeading;

		if (this.enableCompassUpdate) {
			this._changed();
		}
	}

	/**
	 * Process an error message
	 * @param  {Object} error
	 * @return {void}
	 */
	_onError(error) {
		console.error('Error occured: ' + error.code);

		navigator.notification.alert(
			'An error occured in the motion sensor: ' + error.code,
			undefined,
			'Error in Motion Sensor',
			'Ok');
	}

	/**
	 * Call all the listeners
	 * @return {void}
	 */
	_changed() {
		this.listeners.forEach((listener) => {
			listener({
				x: this.x,
				y: this.y,
				z: this.z,
				heading: this.heading
			});
		});
	}
}

export default MotionSensor;
