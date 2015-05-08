import randn from '../util/math';
import polarToCartesian from '../util/coordinate-system';

class LandmarkParticleSet {
	constructor(nParticles, stdevRange) {
		this.nParticles = nParticles;
		this.stdevRange = stdevRange;
		this.measurements = 0;
		this.particles = [];
	}

	addMeasurement(x, y, r) {

		return this;
	}

	positionEstimate() {
		if(this.measurements < 3) {
			return {estimate: 0, x: 0, y: 0};
		}
	}

	/**
	 * Init the particle set
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
			const r = r + randn(0, this.stdevRange);

			const {x, y} = polarToCartesian(r, theta);

			this.particles.push({x, y, w: 1});
		}
	}
}

export default LandmarkParticleSet;