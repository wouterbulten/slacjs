import { randn, pdfn } from '../util/math';
import { polarToCartesian } from '../util/coordinate-system';

class LandmarkParticleSet {
	/**
	 * Create a new particle set for finding the initial position of a landmark
	 * @param  {Number} nParticles                 Number of particles
	 * @param  {Number} stdRange                   SD of range measurements
	 * @param  {Number} randomParticles            Number of random particles to use each update
	 * @param  {Number} effectiveParticleThreshold Threshold for resampling
	 * @return {LandmarkParticleSet}
	 */
	constructor(nParticles, stdRange, randomParticles, effectiveParticleThreshold) {
		this.nParticles = nParticles;
		this.stdRange = stdRange;
		this.effectiveParticleThreshold = effectiveParticleThreshold;
		this.randomParticles = randomParticles;

		this.measurements = 0;
		this.particles = [];
	}

	/**
	 * Integrate a new measurement in the particle set
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} r
	 */
	addMeasurement(x, y, r) {

		if (this.measurements === 0) {

			//Init the particle set by adding particles
			this._initSet(x, y, r);
		}
		else {
			this._updateWeights(x, y, r);

			//Determine whether resampling is effective now
			//Is based on the normalised weights
			if (this._numberOfEffectiveParticles() < this.effectiveParticleThreshold) {

				//Use low variance resampling to generate a set of new particles
				//Returns a list of N-randomParticles particles
				let set = this._lowVarianceSampling(this.nParticles - this.randomParticles);

				//Add new uniformly distributed particles tot the set
				//Random particles are distributed around the current position
				this.particles = set.concat(this._randomParticles(this.randomParticles, x, y, r));
			}
		}

		this.measurements++;
		return this;
	}

	/**
	 * Return the current estimate of this landmark's position
	 * @return {Object}
	 */
	positionEstimate() {
		if (this.measurements < 10) {
			return {estimate: 0, x: 0, y: 0};
		}

		const {x, y} = this.bestParticle();

		return {
			estimate: 1,
			x, y
		};
	}

	/**
	 * Return the particle with the heighest weight
	 * @return {Particle}
	 */
	bestParticle() {
		let best = this.particles[0];

		this.particles.forEach((p) => {
			if (p.weight > best.weight) {
				best = p;
			}
		});

		return best;
	}

	/**
	 * Init the particle set
	 *
	 * Creates a set of particles distributed around x,y at a distance
	 * following a normal distribution with r as mean.
	 *
	 * @param  {Number} x Center x
	 * @param  {Number} y Center y
	 * @param  {Number} r range
	 * @return {void}
	 */
	_initSet(x, y, r) {

		const deltaTheta = 2 * Math.PI / this.nParticles;
		const particles = [];

		for (let i = 0; i < (this.nParticles - this.randomParticles); i++) {
			const theta = i * deltaTheta;
			const range = r + randn(0, this.stdRange);
			const {dx, dy} = polarToCartesian(range, theta);

			particles.push({x: x + dx, y: y + dy, weight: 1});
		}

		//Add random portion
		this.particles = particles.concat(this._randomParticles(this.randomParticles, x, y, r));
	}

	/**
	 * Return n random particles
	 * Uniformly distributed around x,y with range r
	 * @param  {Number} n Number of particles to return
	 * @param  {Number} x Center
	 * @param  {Number} y Center
	 * @param  {Number} r Range
	 * @return {Array}
	 */
	_randomParticles(n, x, y, r) {
		const particles = [];

		for (let i = 0; i < n; i++) {

			particles.push({
				x: x + ((Math.random() * r) - (0.5 * r)),
				y: y + ((Math.random() * r) - (0.5 * r)),
				weight: 1
			});
		}

		return particles;
	}
	/**
	 * Update each particle by updating their weights
	 * @param  {Number} x
	 * @param  {Number} y
	 * @param  {Number} r
	 * @return {void}
	 */
	_updateWeights(x, y, r) {

		this.particles.forEach((p) => {

			//Calculate distance estimate
			const dist = Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2));

			//What is the probability of r given dist? p(r|dist)
			//Update the weight accordingly
			//p(r) = N(r|dist,sd)

			const weight = pdfn(r, dist, this.stdRange);

			p.weight = p.weight * weight;
		});
	}

	/**
	 * Calculate the effective number of particles
	 * @see http://en.wikipedia.org/wiki/Particle_filter#Sequential_importance_resampling_.28SIR.29
	 * @return {Number}
	 */
	_numberOfEffectiveParticles() {
		const sumOfWeights = this.particles.reduce((total, p) => total + p.weight, 0);
		const weights = this.particles.map((p) => p.weight / sumOfWeights);

		return 1 / weights.reduce((total, w) => total + (w * w));
	}

	/**
	 * Samples a new particle set
	 * @param {Number}
	 */
	_lowVarianceSampling(nSamples) {
		const M = this.particles.length;
		const weights = this._calculateStackedWeights();
		const rand = Math.random() * (1 / M);

		let c = weights[0];
		let i = 0;

		const newParticleSet = [];

		for (let m = 1; m <= nSamples; m++) {
			const U = rand + (m - 1) * (1 / M);

			while (U > c) {
				i = i + 1;
				c = c + weights[i];
			}

			newParticleSet.push({
				x: this.particles[i].x,
				y: this.particles[i].y,
				weight: 1
			});
		}

		return newParticleSet;
	}

	/**
	 * Calculate a list of stacked normalised weights of the internal particle list
	 * @return {Array}
	 */
	_calculateStackedWeights() {
		const weights = this.particles.map(p => p.weight);
		const min = Math.min.apply(null, weights);

		const stackedWeights = [];

		let total = 0;
		const sums = weights.map(w => {
			total = w + total;
			return total;
		});

		return sums.map(w => w / total);
	}
}

export default LandmarkParticleSet;