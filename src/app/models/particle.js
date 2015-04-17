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

	/**
	 * Register a new landmark
	 * @param {string} options.uid
	 * @param {flaot} options.r
	 */
	addLandmark({uid, r}) {
		let {x, y} = this._getInitialEstimate(uid, r);

		//@todo find better values for initial covariance
		let cov = [[2, 2], [2, 2]];

		this.landmarks.set(uid, {x, y, cov});
	}

	updateLandmark({uid, r}) {

		const l = this.landmarks.get(uid);
		const dx = this.user.x - l.x;
		const dy = this.user.y - l.y;

		//@todo find better values for default coviarance
		const errorCov = 1;

		const dist = Math.max(0.01, Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)));

		//Compute innovation
		const v = r - dist;

		//Compute Jacobian
		const H = [-dx / dist, -dy / dist];

		//Compute innovation covariance
		//covV = H * Cov_s * H^T + error
		const HxCov = [	l.cov[0][0] * H[0] + l.cov[0][1] * H[1],
						l.cov[1][0] * H[0] + l.cov[1][1] * H[1]];

		const covV = HxCov[0] * H[0] + HxCov[1] * H[1] + errorCov;

		//Kalman gain
		const K = [HxCov[0] * (1 / covV), HxCov[1] * (1 / covV)];

		const newX = l.x + (K[0] * v); 
		const newY = l.y + (K[1] * v);

		const deltaCov = K[0] * K[0] * covV + K[1] * K[1] * covV;

		const newCov = [[l.cov[0][0] - deltaCov, l.cov[0][1] - deltaCov],
						[l.cov[1][0] - deltaCov, l.cov[1][1] - deltaCov]];

		//Update particle
		l.x = newX;
		l.y = newY;
		l.cov = newCov;
	}

	/**
	 * Deep copy a mpa
	 * @param  {Map} map
	 * @return {Map}
	 */
	_copyMap(map) {
		const copy = new Map();

		for (let [key, value] of map.entries()) {
			copy.set(key, this._copyLandmark(value));
		}

		return copy;
	}

	/**
	 * Deep copy a landmark
	 * @param  {object} landmark
	 * @return {landmark}
	 */
	_copyLandmark(landmark) {
		let copy = {};

		copy.x = landmark.x;
		copy.y = landmark.y;
		copy.cov = [...landmark.cov];

		return copy;
	}

	/**
	 * Get an initial estimate of a particle
	 * @param  {string} uid
	 * @param  {float} r
	 * @return {object}
	 */
	_getInitialEstimate(uid, r) {
		//Cheat here for now to get a rough estimate
		//Start ugly hack, should be removed when we have
		//a good way to estimate the initial position
		const landmark = window.app.landmarks.landmarkByUid(uid);
		const trueX = landmark.x;
		const trueY = landmark.y;

		return {x: trueX + (3 * Math.random() - 1.5), y: trueY + (3 * Math.random() - 1.5)};
	}
}

export default Particle;