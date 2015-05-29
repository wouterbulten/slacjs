import Particle from './particle';
import LandmarkInitializationSet from './landmark-init-set';
import { lowVarianceSampling, numberOfEffectiveParticles, normalizeWeights } from '../util/sampling';

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

		//Internal list to keep track of initialised landmarks
		this.initialisedLandmarks = [];
		this.landmarkInitSet = new LandmarkInitializationSet();

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

			const { uid, r } = obs;

			if (this.initialisedLandmarks.indexOf(uid) == -1) {

				const {x: uX, y: uY} = this.userEstimate();

				this.landmarkInitSet.addMeasurement(uid, uX, uY, r);

				const {estimate, x, y, varX, varY} = this.landmarkInitSet.estimate(uid);

				if (estimate > 0.6) {

					this.particleList.forEach((p) => {
						p.addLandmark({uid, r}, {x, y}, {varX, varY});
					});

					this.initialisedLandmarks.push(uid);
				}
			}
			else {
				this.particleList.forEach((p) => p.processObservation({uid, r}));
			}
		}

		return this;
	}

	/**
	 * Resample the internal particle list using their weights
	 *
	 * Uses a low variance sample
	 * @return {ParticleSet}
	 */
	resample() {

		const weights = this.particleList.map(p => p.weight);
		if (numberOfEffectiveParticles(weights) < (this.nParticles * 0.5)) {

			this.particleList = lowVarianceSampling(this.nParticles, weights).map((i) => {
				return new Particle({}, this.particleList[i]);
			});
		}
		else {
			console.log('Not resampling');
			console.log(numberOfEffectiveParticles(weights));
		}

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
	 * Compute an average of all landmark estimates
	 * @return {Map}
	 */
	landmarkEstimate() {
		const weights = normalizeWeights(this.particleList.map((p) => p.weight));

		const landmarks = new Map();

		//Loop through all particles to get an estimate of the landmarks
		this.particleList.forEach((p, i) => {
			p.landmarks.forEach((landmark, uid) => {
				if (!landmarks.has(uid)) {
					landmarks.set(uid, {
						x: weights[i] * landmark.x,
						y: weights[i] * landmark.y,
						uid: uid
					});
				}
				else {
					const l = landmarks.get(uid);

					l.x += weights[i] * landmark.x;
					l.y += weights[i] * landmark.y;
				}
			});
		});

		return landmarks;
	}

	/**
	 * Get the best estimate of the current user position
	 * @return {object}
	 */
	userEstimate() {
		const weights = normalizeWeights(this.particleList.map((p) => p.weight));

		return {
			x: this.particleList.reduce((prev, p, i) => prev + (weights[i] * p.user.x), 0),
			y: this.particleList.reduce((prev, p, i) => prev + (weights[i] * p.user.y), 0)
		};
	}
}

export default ParticleSet;