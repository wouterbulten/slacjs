import { randn } from './math.js';

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
 */
export function meanHeading(theta1, theta2) {

	const average = (theta1 + theta2) / 2;

	if (theta2 < 0 && theta1 > 0) {
		return average - Math.PI;
	}

	return average;
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
 * Finds the smallest rotation to the local north (wich is 90deg on a radial axis)
 * @param  {Number} degrees
 * @return {Number}
 */
export function rotationToLocalNorth(degrees) {

	const left = degrees - 90;
	const right = 360 - degrees + 90;

	return Math.min(left, right);
}

export function samplePose({x, y, theta}, {r, heading}) {

	const averageHeading = meanHeading(theta, heading);

	//Use odometry to find a new position
	const {dx, dy} = polarToCartesian(r, averageHeading);

	return {x: x + dx, y: y + dy, theta: averageHeading};
}