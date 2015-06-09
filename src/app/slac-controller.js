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
	 * @return {SlacController}
	 */
	constructor(nParticles, defaultPose, landmarkConfig, motionUpdateRate) {

		//Initialize a new particle set at 'defaultPose'
		this.particleSet = new ParticleSet(nParticles, defaultPose);
		
		//Create a new sensor that tracks signal strengths
		this.sensor = new Sensor(landmarkConfig);

		//Create new pedometer to count steps
		this.pedometer = new Pedometer(motionUpdateRate);
		this.pedometer.onStep(() => this._update());

		//Create a local copy of the current heading
		this.heading = 0.0;

		//Step size of a single step in meters
		this.stepSize = 0.8;

		this.started = false;

		this.callback = undefined;
	}

	/**
	 * Start the controller
	 * @return {SlacController}
	 */
	start() {
		this.started = true;

		return this;
	}

	/**
	 * Pause the controller
	 * @return {SlacController}
	 */
	pause() {
		this.started = false;

		return this;
	}

	/**
	 * Process a new motion event
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} z
	 */
	addMotionObservation(x, y, z, heading) {

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

		//Add the device observation to the sensor for filtering
		this.sensor.addObservation(uid, rssi, name);
	}

	/**
	 * Add a callback function that is run on every update
	 *
	 * The callback receives the particle set on each call.
	 * @param  {Function} callback
	 * @return {void}
	 */
	onUpdate(callback) {
		this.callback = callback;
	}

	/**
	 * Run the full SLAM update
	 * @return {void}
	 */
	_update() {

		if(!this.started) {
			return;
		}

		console.log('[SLACjs/controller] Update running');

		//@todo Check for the amount of steps here
		const dist = 1 * this.stepSize;
		const heading = this.heading;

		//Sample a new pose for each particle in the set
		this.particleSet.samplePose({r: dist, theta: heading});

		//Let each particle process the observations
		this.sensor.getObservations().forEach((obs) => {
			this.particleSet.processObservation(obs)
		});

		//Resample, this is not done on every iteration and the
		//particle set determines whether a resmample is required
		this.particleSet.resample();

		if(this.callback !== undefined) {
			this.callback(this.particleSet);
		}
	}

}

export default SlacController;