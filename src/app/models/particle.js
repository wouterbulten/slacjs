import User from './user';
import { randn } from '../util/math';

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
			this.user = User.copyUser(parent.user);
			this.landmarks = this._copyMap(parent.landmarks);
		}
		else {
			this.user = new User({x, y, theta});	
			this.landmarks = new Map();
		}

		this.weight = 1;
	}

	/**
	 * Given a control, sample a new user position
	 * @param  {[type]} control [description]
	 * @return {Particle}
	 */
	samplePose(control) {

		//Do something with the control here
		//Random values for now
		const r = control.r //+ randn(0, 0.5);
		const theta = control.theta //+ randn(0, 0.5);

		this.user.move({r, theta});

		return this;
	}

	/**
	 * Reset the weight of the particle
	 * @return {Particle}
	 */
	resetWeight() {
		this.weight = 1;

		return this;
	}

	/**
	 * Register a new landmark
	 * @param {string} options.uid
	 * @param {float} options.r
	 */
	addLandmark({uid, r}, {x, y}) {

		//@todo find better values for initial covariance
		let cov = [[0.01, 0.01], [0.01, 0.01]];

		this.landmarks.set(uid, {x, y, cov});
	}

	/**
	 * Update a landmark using the EKF update rule
	 * @param  {string} options.uid landmark id
	 * @param  {float} options.r    range measurement
	 * @return {void}
	 */
	processObservation({uid, r}) {

		//Find the correct EKF
		const l = this.landmarks.get(uid);

		//Compute the difference between the predicted user position of this 
		//particle and the predicted position of the landmark.
		const dx = this.user.x - l.x;
		const dy = this.user.y - l.y;

		//@todo find better values for default coviarance
		const errorCov = 0.01 * (Math.random() - 0.5);

		const dist = Math.max(0.001, Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)));

		//Compute innovation: difference between the observation and the predicted value
		const v = r - dist;

		//Compute Jacobian
		const H = [-dx / dist, -dy / dist];

		//Compute innovation covariance
		//covV = H * Cov_s * H^T + error
		const HxCov = [	l.cov[0][0] * H[0] + l.cov[0][1] * H[1],
						l.cov[1][0] * H[0] + l.cov[1][1] * H[1]];

		const covV = (HxCov[0] * H[0]) + (HxCov[1] * H[1]) + errorCov;

		//Kalman gain
		const K = [HxCov[0] * (1 / covV), HxCov[1] * (1 / covV)];

		//Calculate the new position of the landmark
		const newX = l.x + (K[0] * v); 
		const newY = l.y + (K[1] * v);

		const deltaCov = (K[0] * K[0] * covV) + (K[1] * K[1] * covV);

		const newCov = [[l.cov[0][0] - deltaCov, l.cov[0][1] - deltaCov],
						[l.cov[1][0] - deltaCov, l.cov[1][1] - deltaCov]];

		//Update the weight of the particle
		this.weight = this.weight - (v * (1 / covV) * v);

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
}

export default Particle;