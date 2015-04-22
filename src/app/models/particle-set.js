import Particle from './particle';

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
			this.particleList.forEach((p) => p.processObservation(obs));
		}

		return this;
	}

	/**
	 * Resample the internal particle list using their weights
	 * @return {ParticleSet}
	 */
	resample() {

		const weights = this._calculateStackedWeights();
		console.log(weights);
		const newParticles = [];

		for (let i = 0; i < this.nParticles; i++) {
			const sample = this.particleList[this._weightedRandomSample(weights)];
			newParticles[i] = new Particle({}, sample);
		}

		this.particleList = newParticles;

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
	 * Compute a list of normalised weights of the internal particle list
	 * @return {Array}
	 */
	_calculateNormalisedWeights() {

		if(this.particleList.length == 1) {
			return [1];
		}

		const weights = this.particleList.map(p => p.weight);
		console.log(weights);
		const max = Math.max.apply(null, weights);
		const min = Math.min.apply(null, weights);
		const diff = max - min;

		//If all weights are equal we just return an
		//array with 1/N
		if(diff === 0) {
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

		if(min < 0) {
			//Make sure all weights are above zero
			weights.forEach((w, i, a) => a[i] = w - min);
		}

		const stackedWeights = [];

		let total = 0;
		const sums = weights.map(w => {
			total = w + total;
			console.log(total)
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

		console.error("Did not draw a sample");
	}
}

export default ParticleSet;