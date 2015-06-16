/**
 * Convert an angle in degrees to a radian angle and substract the base
 *
 * Base corresponds to theta=0. Degrees are converted from CW to CWW.
 *
 * @param  {Number} heading Angle in degrees
 * @param  {Number} base Base angle in degrees
 * @return {Number} between -pi and pi
 */
export function degreeToNormalisedHeading(heading, base) {

	let diff = heading - base;

	if (diff < 0) {
		diff += 360;
	}
	else if (diff > 360) {
		diff -= 360;
	}

	return limitTheta(degreeToRadian(clockwiseToCounterClockwise(diff)));
}

/**
 * Add two radials, keeps the result within [-pi, pi]
 * @param {float} t1
 * @param {float} t2
 * @return {float} Sum of t1 and t2
 */
export function addTheta(t1, t2) {
	console.error('Function is deprecated, use limitTheta instead.');

	let theta = t1 + t2;

	if (theta > Math.PI) {
		return Math.PI - theta;
	}
	else if (theta < -Math.PI) {
		return -Math.PI - theta;
	}

	return theta;
}

/**
 * Make sure theta remains between [-pi, pi]
 * @param  {Number} theta
 * @return {Number}
 */
export function limitTheta(theta) {

	if (theta > Math.PI) {
		return theta - (Math.PI * 2);
	}
	else if (theta < -Math.PI) {
		return theta + (Math.PI * 2);
	}

	return theta;
}

/**
 * Compute the average heading between two angles
 * @param  {Number} theta1
 * @param  {Number} theta2
 * @return {Number}
 * @see https://en.wikipedia.org/wiki/Mean_of_circular_quantities
 */
export function meanHeading(theta1, theta2) {

	const oldTheta1 = theta1;
	const oldTheta2 = theta2;

	if (theta1 < 0) {
		theta1 += 2 * Math.PI;
	}
	if (theta2 < 0) {
		theta2 += 2 * Math.PI;
	}

	const {dx: x1, dy: y1} = polarToCartesian(1, theta1);
	const {dx: x2, dy: y2} = polarToCartesian(1, theta2);

	const avgX = (x1 + x2) / 2;
	const avgY = (y1 + y2) / 2;

	const {theta: heading} = cartesianToPolar(avgX, avgY);

	console.log({oldTheta1, oldTheta2, theta1, theta2, heading});

	return heading;
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

	const theta = Math.atan2(dy, dx);

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

/**
 * Convert a clockwise degree to a counter clockwise degree
 * @param  {Number} degrees
 * @return {Number}
 */
export function clockwiseToCounterClockwise(degrees) {
	return 360 - degrees;
}

/**
 * Finds the smallest rotation to the local north (wich is 90deg on a radial axis)
 * @param  {Number} degrees
 * @return {Number}
 */
export function rotationToLocalNorth(degrees) {

	const left = degrees - 90;
	const right = 360 - degrees + 90;

	return Math.min(left, right);
}
