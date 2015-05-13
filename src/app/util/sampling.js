/**
 * Normalize a set of weights
 * @param  {Array} weights
 * @return {Array}
 */
export function normalizeWeights(weights) {
	const totalWeight = weights.reduce((total, w) => total + w, 0);

	return weights.map(w => w / totalWeight);
}

/**
 * Convert an array of weights to an cumulative sum array
 * @param  {Array} weights
 * @return {Array}
 */
export function weightedCumulativeSum(weights) {

	const normalisedWeights = normalizeWeights(weights);

	let total = 0;
	return normalisedWeights.map(w => {
		total = w + total;
		return total;
	});
}

/**
 * Samples a new set using a low variance sampler from a array of weights
 * @param {Number} nSamples Number of samples to sample
 * @param {Array} weights 	Weight array
 * @return {Array} An array with indices corresponding to the selected weights
 */
export function lowVarianceSampling(nSamples, weights) {

	const M = weights.length;
	const normalizedWeights = normalizeWeights(weights);

	const rand = Math.random() * (1 / M);

	let c = normalizedWeights[0];
	let i = 0;

	const set = [];

	for (let m = 1; m <= nSamples; m++) {
		const U = rand + (m - 1) * (1 / M);

		while (U > c) {
			i = i + 1;
			c = c + normalizedWeights[i];
		}

		set.push(i);
	}

	return set;
}

/**
 * Sample using roulette wheel sampler from a array of weights
 * @param {Number} nSamples Number of samples to sample
 * @param {Array} weights 	Weight array
 * @return {Array} An array with indices corresponding to the selected weights
 */
export function rouletteWheelSampling(nSamples, weights) {

	const stackedWeights = weightedCumulativeSum(weights);
	const set = [];

	for (let i = 0; i < nSamples; i++) {

		const rand = Math.random();

		for (var m = 0; m < stackedWeights.length; m++) {

			if (stackedWeights[m] >= rand) {
				set.push(m);

				break;
			}
		}
	}

	return set;
}

/**
 * Calculate the effective number of particles
 * @see http://en.wikipedia.org/wiki/Particle_filter#Sequential_importance_resampling_.28SIR.29
 * @return {Number}
 */
export function numberOfEffectiveParticles(weights) {
	const normalisedWeights = normalizeWeights(weights);

	return 1 / normalisedWeights.reduce((total, w) => total + (w * w));
}