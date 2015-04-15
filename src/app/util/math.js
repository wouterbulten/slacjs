/**
 * Random following normal distribution
 * @param  {float} mean mean
 * @param  {float} sd   standard deviation
 * @return {float}      
 */
export function randn(mean, sd) {

	//Retrieved from jStat
	let u, v, x, y, q, mat;

	do {
		u = Math.random();
		v = 1.7156 * (Math.random() - 0.5);
		x = u - 0.449871;
		y = Math.abs(v) + 0.386595;
		q = x * x + y * (0.19600 * y - 0.25472 * x);
	} while (q > 0.27597 && (q > 0.27846 || v * v > -4 * Math.log(u) * u * u));

	return (v/u) * sd + mean;
}

/**
 * Compute the log with a given base
 *
 * Used primarily as log10 is not implemented yet on mobile browsers
 * 
 * @param  {int}
 * @param  {int}
 * @return {float}
 */
export function log(x, base) {
	return Math.log(x) / Math.log(base);
}