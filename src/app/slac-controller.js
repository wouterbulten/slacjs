import ParticleSet from './models/particle-set';
import Sensor from './models/sensor';
import Pedometer from './device/pedometer';

class SlacController {

	/**
	 * Main controller for SLAC
	 * @param  {Number} nParticles       Number of particles
	 * @param  {Object} defaultPose      Starting pose of particles
	 * @param  {Object} landmarkConfig   Landmark configuration
	 * @param  {Number} motionUpdateRate Motion update frequency
	 * @param  {Number} stepSize
	 * @return {SlacController}
	 */
	constructor(config) {

		//Initialize a new particle set at 'defaultPose'
		this.particleSet = new ParticleSet(
			config.particles.N,
			config.particles.effectiveParticleThreshold,
			config.particles.user, config.particles.init
		);

		//Create a new sensor that tracks signal strengths
		this.sensor = new Sensor(config.landmarkConfig, config.sensor.rssi.kalman, config.sensor.rssi.minMeasurements);

		//Define when we treat a landmark as new
		this.sensor.hasMovedIf((newLandmark, oldLandmark) => {
			return newLandmark.uid == oldLandmark.uid && newLandmark.name != oldLandmark.name;
		});

		//Create new pedometer to count steps
		this.pedometer = new Pedometer(config.sensor.motion.frequency);
		this.pedometer.onStep(() => this._update());

		//Create a local copy of the current heading
		this.heading = config.particles.user.defaultPose.theta;

		//Step size of a single step in meters
		this.stepSize = config.pedometer.stepSize;

		this.iteration = 0;
		this.started = false;
		this.paused = false;
		this.afterUpdateCallback = undefined;
		this.beforeUpdateCallback = undefined;
		this.lastObservations = [];
	}

	/**
	 * Start the controller
	 * @return {SlacController}
	 */
	start() {
		this.started = true;
		this.paused = false;

		return this;
	}

	/**
	 * Pause the controller
	 * @return {SlacController}
	 */
	pause() {
		this.started = !this.started;
		this.paused = true;

		return this;
	}

	/**
	 * Process a new motion event
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} z
	 */
	addMotionObservation(x, y, z, heading) {

		if (!this.started) {
			return;
		}

		//Update the pedometer
		this.pedometer.processMeasurement(x, y, z);

		this.heading = heading;
	}

	/**
	 * Register a new device observation
	 * @param {String} uid
	 * @param {Number} rssi
	 * @param {String} name
	 */
	addDeviceObservation(uid, rssi, name) {

		if (!this.started) {
			return;
		}

		//Add the device observation to the sensor for filtering
		this.sensor.addObservation(uid, rssi, name);
	}

	/**
	 * Add a callback function that is run on every update
	 *
	 * The callback receives the particle set and the interation number on each call.
	 * @param  {Function} callback
	 * @return {void}
	 */
	onUpdate(callback) {
		this.afterUpdateCallback = callback;
	}

	/**
	 * Add a callback function that is run before every update
	 *
	 * The callback receives the particle set and the interation number on each call.
	 * @param  {Function} callback
	 * @return {void}
	 */
	beforeUpdate(callback) {
		this.beforeUpdateCallback = callback;
	}

	/**
	 * Run the full SLAM update
	 * @return {void}
	 */
	_update() {

		if (!this.started) {
			return;
		}

		if (this.beforeUpdateCallback !== undefined) {
			this.beforeUpdateCallback(this.particleSet, this.iteration);
		}

		console.log('[SLACjs/controller] Update running');

		//@todo Check for the amount of steps here
		const dist = 1 * this.stepSize;
		const heading = this.heading;

		//Sample a new pose for each particle in the set
		this.particleSet.samplePose({r: dist, theta: heading});

		//Let each particle process the observations
		this.lastObservations = this.sensor.getObservations();

		this.lastObservations.forEach((obs) => {
			this.particleSet.processObservation(obs)
		});

		//Resample, this is not done on every iteration and the
		//particle set determines whether a resmample is required
		this.particleSet.resample();

		this.iteration++;

		if (this.afterUpdateCallback !== undefined) {
			this.afterUpdateCallback(this.particleSet, this.iteration);
		}
	}

}

export default SlacController;
