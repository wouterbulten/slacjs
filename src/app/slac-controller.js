class SlacController {

	constructor(nParticles, defaultPose, landmarkConfig, motionUpdateRate) {

		//Initialize a new particle set at 'defaultPose'
		this.particleSet = new ParticleSet(nParticles, defaultPose);
		
		//Create a new sensor that tracks signal strengths
		this.sensor = new Sensor(this.landmarkConfig);

		//Create new pedometer to count steps
		this.pedometer = new Pedometer(motionUpdateRate);
	}

	update(dist, heading, observations) {

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

	addMotionObservation(x, y, z) {

		//Update the pedometer
		this.pedometer.processMeasurement(x, y, z);
	}

	addDeviceObservation(uid, rssi) {

		//Add the device observation to the sensor for filtering
		this.sensor.addObservation({uid, rssi});
	}
}

export default SlacController;