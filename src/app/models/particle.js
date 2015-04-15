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
			this.landmarks = this._copyMap(parent.landmarks);
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
		const r = control.r + (Math.random() - 0.5);
		const theta = control.theta + (0.1 * (Math.random() - 0.5));

		this.user.move({r, theta});

		return this;
	}

	/**
	 * Process a new observation for a landmark
	 * @param  {string} options.id The id of the landmark
	 * @param  {float} options.r   Range measurement to this landmark
	 * @return {Particle}
	 */
	processObservation({uid, r}) {

		//Update landmark
		if (this.landmarks.has(uid)) {
			this.updateLandmark({uid, r});
		}
		else {
			this.addLandmark({uid, r});
		}

		return this;
	}

	addLandmark({uid, r}) {
		let x = 0;
		let y = 0;
		let cov;

		this.landmarks.set(id, {x, y, cov});
	}

	updateLandmark({uid, r}) {

	}

	_copyMap(map) {
		const copy = new Map();

		for (let [key, value] of map.entries()) {
			copy.set(key, this._copyLandmark(value));
		}

		return copy;
	}

	_copyLandmark(landmark) {
		let copy = {};

		copy.x = landmark.x;
		copy.y = landmark.y;
		copy.cov = landmark.cov.clone();

		return copy;
	}
}

export default Particle;