import ParticleSet from './models/particle-set';
import Sensor from './models/sensor';
import Pedometer from './device/pedometer';

class SlacController {

	constructor(nParticles, defaultPose, landmarkConfig, motionUpdateRate) {

		//Initialize a new particle set at 'defaultPose'
		this.particleSet = new ParticleSet(nParticles, defaultPose);
		
		//Create a new sensor that tracks signal strengths
		this.sensor = new Sensor(landmarkConfig);

		//Create new pedometer to count steps
		this.pedometer = new Pedometer(motionUpdateRate);
		this.pedometer.onStep(() => this.update());

		//Create a local copy of the current heading
		this.heading = 0.0;

		//Step size of a single step in meters
		this.stepSize = 0.8;

		this.started = false;
	}

	start() {
		this.started = true;
	}

	pause() {
		this.started = false;
	}

	update() {

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
}

export default SlacController;