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
		this.particles.forEach(function(p) {
			p.samplePose({id, r});
		});
		return this;
	}

	/**
	 * Let each particle process an observation
	 * @param  {int} options.id   Id of the landmark
	 * @param  {float} options.r  Range measurement
	 * @return {ParticleSet}
	 */
	processObservation({id, r}) {
		this.particles.forEach(function(p) {
			p.processObservation({id, r});
		});
		return this;
	}
}

export default ParticleSet;