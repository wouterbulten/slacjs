import LandmarkParticleSet from './landmark-particle-set';

class LandmarkInitializationSet {
	/**
	 * Set containing multiple particle sets for initalisation of landmarks
	 * @param  {Number} nParticles                 Number of particles in each set
	 * @param  {Number} stdRange                   sd of range measurements
	 * @param  {Number} randomParticles            Number of random particles
	 * @param  {Number} effectiveParticleThreshold Threshold of effective particles
	 * @return {LandmarkInitializationSet}
	 */
	constructor({N, sd, randomN, effectiveParticleThreshold}) {
		this.nParticles = N;
		this.stdRange = sd;
		this.randomParticles = randomN;

		if (effectiveParticleThreshold === undefined) {
			this.effectiveParticleThreshold = nParticles / 1.5;
		}
		else {
			this.effectiveParticleThreshold = effectiveParticleThreshold;
		}

		this.particleSetMap = new Map();
	}

	/**
	 * Integrate a new measurement
	 * @param {String} uid UID of landmark
	 * @param {Number} x   Position of user
	 * @param {Number} y   Position of user
	 * @param {Number} r   Range measurement
	 */
	addMeasurement(uid, x, y, r) {
		if (!this.has(uid)) {
			this.particleSetMap.set(uid, new LandmarkParticleSet(
				this.nParticles, this.stdRange, this.randomParticles, this.effectiveParticleThreshold
			));
		}

		this.particleSetMap.get(uid).addMeasurement(x, y, r);

		return this;
	}

	/**
	 * Returns true when there is a particle set for a landmark
	 * @param  {String}  uid
	 * @return {Boolean}
	 */
	has(uid) {
		return this.particleSetMap.has(uid);
	}

	/**
	 * Returns best position estimate for a landmark
	 * @param  {String} uid
	 * @return {Object}
	 */
	estimate(uid) {
		return this.particleSetMap.get(uid).positionEstimate();
	}

	/**
	 * Remove a particle set
	 * @param  {String} uid
	 * @return {void}
	 */
	remove(uid) {
		this.particleSetMap.delete(uid);
	}

	/**
	 * Return all particle sets
	 * @return {Array}
	 */
	particleSets() {
		return this.particleSetMap.values();
	}
}

export default LandmarkInitializationSet;
