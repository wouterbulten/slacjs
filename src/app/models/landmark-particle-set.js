import { randn, pdfn } from '../util/math';
import { polarToCartesian } from '../util/coordinate-system';

class LandmarkParticleSet {
	constructor(nParticles, stdRange) {
		this.nParticles = nParticles;
		this.stdRange = stdRange;
		this.measurements = 0;
		this.particles = [];
		this.effectiveParticleThreshold = 20;
	}

	/**
	 * Integrate a new measurement in the particle set
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} r
	 */
	addMeasurement(x, y, r) {

		if (this.measurements == 0) {
			this._initSet(x, y, r);
		}
		else {
			this._updateWeights(x, y, r);

			if(this._numberOfEffectiveParticles() < this.effectiveParticleThreshold) {
				console.log('resample')
				this._lowVarianceSampling();
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
		if(this.measurements < 3) {
			return {estimate: 0, x: 0, y: 0};
		}
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
		this.particles = [];

		for (let i = 0; i < this.nParticles; i++) {
			const theta = i * deltaTheta;
			const range = r + randn(0, this.stdRange);
			const {dx, dy} = polarToCartesian(range, theta);

			this.particles.push({x: x + dx, y: y + dy, weight: 1});
		}
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
			const dist = Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2))
			//const normalisedDist = dist / this.stdRange;

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
	 */
	_lowVarianceSampling() {
		const M = this.particles.length;
		const weights = this._calculateStackedWeights();
		console.log(weights)
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

			newParticleSet.push({
				x: this.particles[i].x,
				y: this.particles[i].y,
				weight: this.particles[i].weight
			});
		}

		this.particles = newParticleSet;
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