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
export function averageHeading(theta1, theta2) {

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

/**
 * Sample a new pose using the previous state and a control
 * @param  {Number} options.x     Current x
 * @param  {Number} options.y     Current y
 * @param  {Number} options.theta Current heading
 * @param  {Object} control       New control
 * @return {Object}
 */
export function sampleMotionModelOdometry(user, o, oPrev, a1 = 0.05, a2 = 0.001, a3 = 0.05, a4 = 0.05) {

	const deltaRot1 = Math.atan2(o.y - oPrev.y, o.x - oPrev.x) - oPrev.theta;
	const deltaTrans = Math.sqrt(Math.pow((oPrev.x - o.x), 2) + Math.pow((oPrev.y - o.y), 2));
	const deltaRot2 = o.theta - oPrev.theta - deltaRot1;

	//console.log('Rotation 1 is: ' + deltaRot1);
	//console.log('Rotation 2 is: ' + deltaRot2);
	//console.log('Distance trans is: ' + deltaTrans);

	let dDeltaRot1 = deltaRot1 - randn(0, (a1 * (deltaRot1 * deltaRot1)) + (a2 * (deltaTrans * deltaTrans)));
	const dDeltaTrans = deltaTrans - randn(0, (a3 * (deltaTrans * deltaTrans)) + (a4 * (deltaRot1 * deltaRot1)) + (a4 * (deltaRot2 * deltaRot2)));
	const dDeltaRot2 = deltaRot2 - randn(0, (a1 * (deltaRot2 * deltaRot2)) + (a2 * (deltaTrans * deltaTrans)));

	//console.log('Rotation 1 with noise: ' + dDeltaRot1);
	//console.log('Rotation 2 with noise: ' + dDeltaRot2);
	//console.log('Distance trans with noise: ' + dDeltaTrans);

	//console.log('User before x:' + user.x);
	//console.log('User before y:' + user.y);
	//console.log('Theta before: ' + user.theta);

	const x = user.x + (dDeltaTrans * Math.cos(user.theta + dDeltaRot1));
	const y = user.y + (dDeltaTrans * Math.sin(user.theta + dDeltaRot1));

	//console.log('User after x: ' + x);
	//console.log('User after y: ' + y);

	let theta = user.theta + dDeltaRot1 + dDeltaRot2;

	//console.log('Theta after: ' + theta);

	return {x, y, theta};
}