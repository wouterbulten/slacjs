import LandmarkParticleSet from './landmark-particle-set';

class LandmarkInitializationSet {
	constructor(nParticles = 40, stdevRange = 2) {
		this.nParticles = nParticles;
		this.stdevRange = stdevRange;
		this.particles = new Map();
	}

	addMeasurement(uid, x, y, r) {
		if (!this.has(uid)) {
			this.particles.set(uid, new LandmarkParticleSet(this.nParticles, this.stdevRange));
		}

		this.particles.get(uid).addMeasurement(x, y, r);

		return this;
	}

	has(uid) {
		return this.particles.has(uid);
	}

	estimate(uid) {
		return this.particles.get(uid).positionEstimate();
	}

	remove(uid) {
		console.debug("Not implemented yet");
	}
}

export default LandmarkInitializationSet;