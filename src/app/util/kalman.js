/**
 * Kalman filter for 1-dimensional data
 */
class KalmanFilter {

	constructor({R = 1, Q = 1, A = 1, B = 0, C = 1} = {}) {

		this.R = R;
		this.Q = Q;

		this.A = A;
		this.C = C;
		this.B = B;
		this.cov = NaN;
		this.x = NaN; // estimated signal without noise
	}

	filter(z, u = 0) {

		if (isNaN(this.x)) {
			this.x = (1 / this.C) * z;
			this.cov = (1 / this.C) * this.Q * (1 / this.C);
		}
		else {

			//Compute the predicted mean and covariance
			const predX = (this.A * this.x) + (this.B * u);
			const predCov = ((this.A * this.cov) * this.A) + this.R;

			//Compute kalman gain
			this.K = predCov * this.C * (1 / ((this.C * predCov * this.C) + this.Q));

			//Perform the correction step
			this.x = predX + this.K * (z - (this.C * predX));
			this.cov = this.cov - (this.K * this.C * predCov);
		}

		return this.x;
	}

	/**
	 * Set measurement noise Q
	 * @param {Number} noise
	 */
	setMeasurementNoise(noise) {
		this.Q = noise;
	}

	/**
	 * Set the process noise R
	 * @param {Number} noise
	 */
	setProcessNoise(noise) {
		this.R = noise;
	}
}

export default KalmanFilter;