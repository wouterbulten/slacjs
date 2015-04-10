import User from './user';

class Particle {
	/**
	 * Create a new particle
	 * @param  {float} options.x     Initial x position of user
	 * @param  {float} options.y     Initial y position of user
	 * @param  {float} options.theta Initial theta of user
	 * @return {Particle}
	 */
	constructor({x, y, theta}, parent = undefined) {

		if (parent !== undefined) {
			this.weight = parent.weight;
			this.user = User.copyUser(parent.user);
			this.landmarks = new Map();
		}
		else {
			this.user = new User({x, y, theta});
			this.weight = 1;
			this.landmarks = new Map();
		}
	}

	/**
	 * Given a control, sample a new user position
	 * @param  {[type]} control [description]
	 * @return {Particle}
	 */
	samplePose(control) {

		//Do something with the control here
		//Random values for now
		const r = 5;
		const theta = Math.random() * 2 * Math.PI;

		this.user.move(r, theta);

		return this;
	}

	/**
	 * Process a new observation for a landmark
	 * @param  {string} options.id The id of the landmark
	 * @param  {float} options.r   Range measurement to this landmark
	 * @return {Particle}
	 */
	processObservation({id, r}) {

		//Update landmark
		if (this.landmarks.has(id) === undefined) {
			this.addLandmark({id, r});
		}
		else {
			this.updateLandmark({id, r});
		}

		return this;
	}

	addLandmark({id, r}) {

	}

	updateLandmark({id, r}) {

	}
}

export default Particle;