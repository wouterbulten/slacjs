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
		this.nParticles = 40;

		this.particles = [];

		for (let i = 0; i < nParticles; i++) {
			this.particles.push(new Particle({x, y, theta}));
		}
	}

	/**
	 * Given a control, let each particle sample a new user position
	 * @param  {[type]} control [description]
	 * @return {ParticleSet}
	 */
	samplePose(control) {
		this.particles.forEach((p) => p.samplePose(control));

		return this;
	}

	/**
	 * Let each particle process an observation
	 * @param  {int} options.id   Id of the landmark
	 * @param  {float} options.r  Range measurement
	 * @return {ParticleSet}
	 */
	processObservation({id, r}) {
		this.particles.forEach((p) => p.processObservation({id, r}));

		return this;
	}

	/**
	 * Resample the internal particle list using their weights
	 * @return {ParticleSet}
	 */
	resample() {
		const weights = this._calculateNormalisedWeights();

		const newParticles = [];

		for (let i = 0; i < this.nParticles; i++) {
			const sample = this.particles[this._weightedRandomSample(weights)];
			newParticles[i] = new Particle({}, sample);
		}

		this.particles = newParticles;
		
		return this;
	}

	/**
	 * Compute a list of normalised stacked weights of the internal particle list
	 * @return {Array}
	 */
	_calculateNormalisedWeights() {
		const stackedWeights = [];
		const sumOfWeigths = this.particles.reduce((total, p, i) => {
			const sum = total + p.weight;
			stackedWeights[i] = sum;
			return sum;
		}, 0);

		return stackedWeights.map((x) => x / sumOfWeigths);
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
	}
}

export default ParticleSet;