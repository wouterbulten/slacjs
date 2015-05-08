import Particle from './particle';
import VoteSet from './vote-set';

class ParticleSet {
	/**
	 * Create a new particle set with a given number of particles
	 * @param  {int} nParticles    	 Number of particles
	 * @param  {float} options.x     Initial x postion of user
	 * @param  {float} options.y     Initial y position of user
	 * @param  {float} options.theta Initial theta of user
	 * @return ParticleSet
	 */
	constructor(nParticles, {x, y, theta}) {
		this.nParticles = nParticles;

		this.particleList = [];

		//Internal list to keep track of initialised landmarks
		this.initialisedLandmarks = [];
		this.landmarkVoteSet = new VoteSet();

		for (let i = 0; i < nParticles; i++) {
			this.particleList.push(new Particle({x, y, theta}));
		}
	}

	/**
	 * Given a control, let each particle sample a new user position
	 * @param  {[type]} control [description]
	 * @return {ParticleSet}
	 */
	samplePose(control) {
		this.particleList.forEach((p) => p.samplePose(control));

		return this;
	}

	/**
	 * Let each particle process an observation
	 * @param  {object} obs
	 * @return {ParticleSet}
	 */
	processObservation(obs) {

		if (obs !== {}) {

			const { uid, r } = obs;
			
			if (this.initialisedLandmarks.indexOf(uid) == -1) {
				
				const {x: uX, y: uY} = this.userEstimate();

				this.landmarkVoteSet.addMeasurement(uid, uX, uY, r);

				const {estimate, x, y} = this.landmarkVoteSet.estimate(uid);

				if(estimate > 0.6) {
					
					this.particleList.forEach((p) => {
						p.addLandmark({uid, r}, {x, y});
					});

					this.initialisedLandmarks.push(uid);
					this.landmarkVoteSet.remove(uid);
				}
				
			}
			else {
				//this.particleList.forEach((p) => p.processObservation({uid, r}));
			}
		}

		return this;
	}

	/**
	 * Resample the internal particle list using their weights
	 *
	 * Uses a low variance sample
	 * @return {ParticleSet}
	 */
	resample() {
		const variance = this._weightVariance();

		if (variance > 0.02) {
			this._lowVarianceSampling();
		}

		return this;
	}

	/**
	 * Get particles
	 * @return {[Array]
	 */
	particles() {
		return this.particleList;
	}

	/**
	 * Return the particle with the heighest weight
	 * @return {Particle}
	 */
	bestParticle() {
		let best = this.particleList[0];

		this.particleList.forEach((p) => {
			if (p.weight > best.weight) {
				best = p;
			}
		});

		return best;
	}

	/**
	 * Get the best estimate of the current user position
	 * @return {object}
	 */
	userEstimate() {
		const particle = this.bestParticle();

		return {x: particle.user.x, y: particle.user.y};
	}

	/**
	 * Samples a new particle set
	 */
	_lowVarianceSampling() {
		const M = this.particleList.length;
		const weights = this._calculateStackedWeights();
		const rand = Math.random() * (1 / M);

		let c = weights[0];
		let i = 0;

		const newParticleSet = [];

		for (let m = 1; m <= M; m++) {
			const U = rand + (m - 1) * (1 / M);

			while (U > c) {
				i = i + 1;
				c = c + weights[i];
			}

			newParticleSet.push(new Particle({}, this.particleList[i]));
		}

		this.particleList = newParticleSet;
	}

	/**
	 * Calculates the variance of the weights
	 * @return {float}
	 */
	_weightVariance() {
		if(this.particleList.length < 2) {
			return false;
		}

		const weights = this._calculateNormalisedWeights();
		const sum = weights.reduce((total, w) => total + w, 0);
		const mean = sum / weights.length;

		return weights.reduce((total, w) => {
			return total + ((w - mean) * (w - mean))

		}, 0) / weights.length;
	}

	/**
	 * Compute a list of normalised weights of the internal particle list
	 * @return {Array}
	 */
	_calculateNormalisedWeights() {

		if (this.particleList.length == 1) {
			return [1];
		}

		const weights = this.particleList.map(p => p.weight);
		const max = Math.max.apply(null, weights);
		const min = Math.min.apply(null, weights);
		const diff = max - min;

		//If all weights are equal we just return an
		//array with 1/N
		if (diff === 0) {
			const nw = 1 / weights.length;
			return weights.map(w => nw);
		}

		return weights.map(w => (w - min) / diff);
	}

	/**
	 * Calculate a list of stacked normalised weights of the internal particle list
	 * @return {Array}
	 */
	_calculateStackedWeights() {
		const weights = this.particleList.map(p => p.weight);
		const min = Math.min.apply(null, weights);

		if (min < 0) {
			//Make sure all weights are above zero
			weights.forEach((w, i, a) => a[i] = w - min);
		}

		const stackedWeights = [];

		let total = 0;
		const sums = weights.map(w => {
			total = w + total;
			return total;
		});

		return sums.map(w => w / total);
	}

	/**
	 * Draw a weighted sample from from a list and return the index
	 * @param  {Array} weights
	 * @return {int}
	 */
	_weightedRandomSample(weights) {
		const rand = Math.random();

		for (let m = 0; m < weights.length; m++) {

			if (weights[m] > rand) {
				return m;
			}
		}

		console.error('Did not draw a sample');
	}
}

export default ParticleSet;