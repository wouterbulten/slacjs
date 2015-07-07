import { randn, pdfn, variance } from '../util/math';
import { lowVarianceSampling, numberOfEffectiveParticles, normalizeWeights } from '../util/sampling';
import { polarToCartesian } from '../util/motion';

class LandmarkParticleSet {
	/**
	 * Create a new particle set for finding the initial position of a landmark
	 * @param  {Number} nParticles                 Number of particles
	 * @param  {Number} stdRange                   SD of range measurements
	 * @param  {Number} randomParticles            Number of random particles to use each update
	 * @param  {Number} effectiveParticleThreshold Threshold for resampling
	 * @param  {Number} maxVariance				   The maximum variance before a landmark estimate is returned
	 * @return {LandmarkParticleSet}
	 */
	constructor(nParticles, stdRange, randomParticles, effectiveParticleThreshold, maxVariance) {
		this.nParticles = nParticles;
		this.stdRange = stdRange;
		this.effectiveParticleThreshold = effectiveParticleThreshold;
		this.randomParticles = randomParticles;
		this.maxVariance = maxVariance;

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

			//Init the particle set by adding random particles around the user
			this.particles = this._randomParticles(this.nParticles, x, y, r);
		}
		else {
			this._updateWeights(x, y, r);

			//Determine whether resampling is effective now
			//Is based on the normalised weights
			const weights = this.particles.map(p => p.weight);
			if (numberOfEffectiveParticles(weights) < this.effectiveParticleThreshold) {

				//Use low variance resampling to generate a set of new particles
				//Returns a list of N-randomParticles particles
				let set = this._resample(this.nParticles - this.randomParticles);

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

		//Fast check, never return before we have at least multiple measurements
		if (this.measurements < 10) {
			return {estimate: 0, x: 0, y: 0, varX: 1, varY: 1};
		}

		const {varX, varY} = this._particleVariance();

		//@todo Make this constraint configurable
		if (varX < this.maxVariance && varY < this.maxVariance) {

			//Compute a weighted average of the particles
			const {x, y} = this.averagePosition();

			return {
				estimate: 1,
				x, y,
				varX, varY
			};
		}

		return {estimate: 0, x: 0, y: 0, varX: 1, varY: 1};
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
	 * Return a weighted average of this particle set
	 * @return {Object} x,y
	 */
	averagePosition() {

		const weights = normalizeWeights(this.particles.map((p) => p.weight));

		return {
			x: this.particles.reduce((prev, p, i) => prev + (weights[i] * p.x), 0),
			y: this.particles.reduce((prev, p, i) => prev + (weights[i] * p.y), 0)
		};
	}

	/**
	 * Return the particle variance in X and Y
	 * @return {Object} varx, vary
	 */
	_particleVariance() {

		return {
			varX: variance(this.particles, (p) => p.x),
			varY: variance(this.particles, (p) => p.y)
		};
	}

	/**
	 * Resample the particle set and return a given number of new particles
	 * @param  {Number} nSamples Number of particles to return
	 * @return {Array}
	 */
	_resample(nSamples) {
		const weights = this.particles.map(p => p.weight);

		return lowVarianceSampling(nSamples, weights).map((i) => {
			return {
				x: randn(this.particles[i].x, this.stdRange / 4),
				y: randn(this.particles[i].y, this.stdRange / 4),
				weight: 1
			};
		});
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
	_randomParticles(n, x, y, r) {

		const deltaTheta = 2 * Math.PI / n;
		const particles = [];

		for (let i = 0; i < n; i++) {
			const theta = i * deltaTheta;
			const range = r + randn(0, this.stdRange);
			const {dx, dy} = polarToCartesian(range, theta);

			particles.push({x: x + dx, y: y + dy, weight: 1});
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
}

export default LandmarkParticleSet;
