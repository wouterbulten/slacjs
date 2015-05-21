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
		const r = control.r + randn(0, 0.5);
		const theta = control.theta + randn(0, 0.01);

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
		let cov = [[0.1, 0], [0, 0.1]];

		this.landmarks.set(uid, {x, y, cov});
	}

	/**
	 * Update a landmark using the EKF update rule
	 * @param  {string} options.uid landmark id
	 * @param  {float} options.r    range measurement
	 * @return {void}
	 * @see http://en.wikipedia.org/wiki/Extended_Kalman_filter#Discrete-time_predict_and_update_equations
	 */
	processObservation({uid, r}) {

		//Find the correct EKF
		const l = this.landmarks.get(uid);

		//Compute the difference between the predicted user position of this
		//particle and the predicted position of the landmark.
		//The movement model for landmarks is static, i.e. x_t = x_t-1
		const dx = this.user.x - l.x;
		const dy = this.user.y - l.y;

		// predictCov = I * cov * I + Rt
		// = cov + Rt
		const RtSd = 0.1;
		//const predictCov = [[l.cov[0][0] + randn(0, RtSd), l.cov[0][1] + randn(0, RtSd)],
		//					[l.cov[1][0] + randn(0, RtSd), l.cov[1][1] + randn(0, RtSd)]];
		const predictCov = [[1 + randn(0, RtSd), 0 + randn(0, RtSd)],
							[0 + randn(0, RtSd), 1 + randn(0, RtSd)]];

		// h(x_t) = sqrt((ux - lx)^2 + (uy - ly)^2)
		const dist = Math.max(0.001, Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)));

		//Compute innovation: difference between the observation and the predicted value
		//v = z - h(x_t) where z=r
		const v = r - dist;

		//Compute Jacobian
		//This is the partial derivate of h in x and y
		const H = [-dx / dist, -dy / dist];

		//Compute the covariance of the innovation
		//covInv = H * predictCov * H^T + Qt
		const QtSd = 0.1;
		const HxCov = [H[0] * predictCov[0][0] + H[1] * predictCov[1][0],
						H[0] * predictCov[0][1] + H[1] * predictCov[1][1]];

		const covInv = HxCov[0] * H[0] + HxCov[1] * H[1] + randn(0, QtSd);

		//Calculate the Kalmain gain
		//K = predictCov * H^T * (covInv)^-1
		let K = [predictCov[0][0] * H[0] + predictCov[0][1] * H[1],
					predictCov[1][0] * H[0] + predictCov[1][1] * H[1]];
		K = [K[0] / covInv, K[1] / covInv];

		//Update x,y according to state_t = state_t-1 + K*v
		const newX = l.x + (K[0] * v);
		const newY = l.y + (K[0] * v);

		//Update covariance with cov_t = (I - KH) cov_t-1
		const KH = K[0] * H[0] + K[1] + H[1];
		const IKH = [[1 - KH, 0 - KH],
					[0 - KH, 1 - KH]];
		const newCov = [[	l.cov[0][0] * IKH[0][0] + l.cov[0][1] * IKH[1][0],
							l.cov[0][0] * IKH[0][1] + l.cov[0][1] * IKH[1][1]
						],[
							l.cov[1][0] * IKH[0][0] + l.cov[1][1] * IKH[1][0],
							l.cov[1][0] * IKH[0][1] + l.cov[1][1] * IKH[1][1]
						]];

		//Update the weight of the particle
		this.weight = this.weight - (v * (1 / covInv) * v);

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