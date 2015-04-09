/**
 * Add two radials
 * @param {float} t1
 * @param {float} t2
 * @return {float} Sum of t1 and t2
 */
export function addTheta(t1, t2) {
	let theta = t1 + t2;
	const twoPi = Math.PI * 2;

	if (theta > (twoPi)) {
		theta -= twoPi;
	}
	else if (theta < 0) {
		theta += twoPi;
	}

	return theta;
}

/**
 * Convert polar coordinates to cartesian coordinates
 * @param  {[type]} r     [description]
 * @param  {[type]} theta [description]
 * @return {[type]}       [description]
 */
export function polarToCartesian(r, theta) {
	const x = r * Math.cos(theta);
	const y = r * Math.sin(theta);

	return {x, y};
}