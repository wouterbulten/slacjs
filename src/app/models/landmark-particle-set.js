import randn from '../util/math';
import polarToCartesian from '../util/coordinate-system';

class LandmarkParticleSet {
	constructor(nParticles, varRange) {
		this.nParticles = nParticles;
		this.varRange = varRange;
		this.measurements = 0;
		this.particles = [];
	}

	addMeasurement(x, y, r) {

		if(this.measurements == 0) {
			this._initSet(x, y, r);
		}
		else {
			this._updateWeights(x, y, r);
		}

		this.measurements++;
		return this;
	}

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

		const deltaTheta = 2 * Math.PI / nParticles;
		this.particles = [];

		for (let i = 0; i < this.nParticles; i++) {
			const theta = i * deltaTheta;
			const r = r + randn(0, this.varRange);

			const {x, y} = polarToCartesian(r, theta);

			this.particles.push({x, y, weight: 1});
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

			//What is the probability of r given dist? p(r|dist)
			//Update the weight accordingly
			//p(r) = N(r|dist,sd)

		})
	}

	/**
	 * Samples a new particle set
	 */
	_lowVarianceSampling() {
		const M = this.particles.length;
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

			newParticleSet.push({
				x: this.particles[i].x
				y: this.particles[i].y
				weight: this.particles[i].weight
			});
		}

		this.particleList = newParticleSet;
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