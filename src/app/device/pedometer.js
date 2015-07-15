import KalmanFilter from '../util/kalman';

/**
 * Accelerometer based pedometer
 *
 * Based on a FirefoxOS ES5 implementation.
 *
 * @see http://sebastien.menigot.free.fr/index.php?view=article&id=93
 * @see http://www.analog.com/library/analogdialogue/archives/44-06/pedometer.html
 */
class Pedometer {

	constructor(updateRate) {

		const windowSize = Math.round(2 / (updateRate / 1000));

		this.accNorm = new Array(windowSize); // amplitude of the acceleration

		this.varAcc   = 0.0; // variance of the acceleration on the window L
		this.minAcc   = 1.0;  // minimum of the acceleration on the window L
		this.maxAcc   = -Infinity; // maximum of the acceleration on the window L
		this.threshold = -Infinity; // threshold to detect a step
		this.sensitivity = 1.0 / 30.0;  // sensitivity to detect a step

		this.stepCount = 0;           // number of steps
		this.stepArr   = new Array(windowSize); // steps in 2 seconds

		this.updateRate = updateRate; //Update rate in ms

		this.filter = new KalmanFilter();

		//Callback to run after a new step
		this.callbackOnStep = undefined;
	}

	/**
	 * Process a new accelerometer measurement
	 * @param  {Number} x
	 * @param  {Number} y
	 * @param  {Number} z
	 * @return {void}
	 */
	processMeasurement(x, y, z) {

		const norm = this._computeNorm(x, y, z);

		this.accNorm.push(norm);
		this.accNorm.shift();

		this._stepDetection();
	}

	/**
	 * Register a callback function to run on a new step
	 * @param  {Function} callback
	 * @return {void}
	 */
	onStep(callback) {
		this.callbackOnStep = callback;
	}

	/**
	 * Detect whether the user has done a step
	 * @return {void}
	 */
	_stepDetection() {

		this._computeAccelerationVariance();
		this.minAcc = Math.min.apply(null, this.accNorm);
		this.maxAcc = Math.max.apply(null, this.accNorm);

		this.threshold = (this.minAcc + this.maxAcc) / 2;

		const diff = this.maxAcc - this.minAcc;

		if (

			//Sensiblity, the difference must increase the sensitivity
			Math.abs(diff) >= this.sensitivity &&

			//Acceleration must be above the threshold, and the previous one below (i.e. a new step)
			(this.accNorm[this.accNorm.length - 1] >= this.threshold) &&
			(this.accNorm[this.accNorm.length - 2] < this.threshold) &&

			(this.stepArr[this.stepArr.length - 1] === 0)
		) {
			this.stepCount++;
			this.stepArr.push(1);
			this.stepArr.shift();

			if (this.callbackOnStep !== undefined) {
				this.callbackOnStep();
			}
		}
		else {
			this.stepArr.push(0);
			this.stepArr.shift();
		}
	}

	/**
	 * Compute the norm of the acceleration vector
	 * @param  {Number} x
	 * @param  {Number} y
	 * @param  {Number} z
	 * @return {Number} norm of the vector
	 */
	_computeNorm(x, y, z) {
		const norm = Math.sqrt((x * x) + (y * y) + (z * z));
		const filteredNorm = this.filter.filter(norm);

		return filteredNorm / 9.80665;
	}

	/**
	 * Compute the variance of the acceleration norm vector
	 * @return {void}
	 */
	_computeAccelerationVariance() {
		let mean  = 0.0;
		let mean2 = 0.0;

		for (var k = 0; k < this.accNorm.length - 1; k++) {
			mean += this.accNorm[k];
			mean2 += this.accNorm[k] * this.accNorm[k];
		}

		this.varAcc = ((mean * mean) - mean2) / this.accNorm.length;

		if ((this.varAcc - 0.5) > 0.0) {
			this.varAcc -= 0.5;
		}

		if (!isNaN(this.varAcc)) {
			this.filter.setMeasurementNoise(this.varAcc);
			this.sensitivity = 2.0 * (Math.sqrt(this.varAcc) / (9.80665 * 9.80665));
		}
		else {
			this.sensitivity = 1.0 / 30.0;
		}
	}
}

export default Pedometer;
