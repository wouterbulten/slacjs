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
 * @param  {float} r
 * @param  {float} theta
 * @return {object}
 */
export function polarToCartesian(r, theta) {
	const dx = r * Math.cos(theta);
	const dy = r * Math.sin(theta);

	return {dx, dy};
}

/**
 * Convert cartesian coordiantes to polar coordinates
 * @param  {float} dx  x value from 0,0
 * @param  {float} dy  y value from 0,0
 * @return {object}
 */
export function cartesianToPolar(dx, dy) {

	const r = Math.sqrt((dx * dx) + (dy * dy));

	let theta;

	//Theta can be computed using tan^-1 when x != 0
	if (dx !== 0) {
		theta = Math.atan(dy / dx);

		//Compensate for negative values of dx and dy
		if (dx < 0) {
			theta += Math.PI;
		}
		else if (dy < 0) {
			theta += 2 * Math.PI;
		}
	}
	else {
		if (dy >= 0) {
			theta = 0;
		}
		else {
			theta = -Math.PI;
		}
	}

	return {r, theta};
}

/**
 * Convert a value in degrees to a radian value
 * @param  {Number} degrees
 * @return {Number}
 */
export function degreeToRadian(degrees) {
	return degrees * (Math.PI / 180);
}