import User from '../models/user';
import { randn } from '../util/math';
import { polarToCartesian, cartesianToPolar, addTheta } from '../util/coordinate-system';

class SimulatedUser extends User {
	/**
	 * Create a simulated user
	 * @param  {object} position     Position of the user
	 * @param  {int} v               Speed of the user
	 * @param  {int} options.xRange  Max range in x direction (both - and +)
	 * @param  {int} options.yRange  Max range in y direciotn (both - and +)
	 * @param  {int} options.padding Padding substracted from the max range
	 * @return {SimulatedUser}
	 */
	constructor(position, v, {xRange, yRange, padding}) {
		super(position);

		this.v = v;
		this.xRange = xRange;
		this.yRange = yRange;
		this.padding = padding;

		this.lastControl = {r: 0, theta: 0};
	}

	/**
	 * Make a semi-random warlk
	 * @return {SimulatedUser}
	 */
	randomWalk() {
		let r = Math.abs(randn(this.v, 2));
		let theta = randn(0.1, 0.2);

		//Save the current x,y locally
		const lastX = this.x;
		const lastY = this.y;

		const {dx, dy} = polarToCartesian(r, addTheta(theta, this.theta));

		let newX = lastX + dx;
		let newY = lastY + dy;

		//Constrain the user position and compute the actual dx,dy values
		if (newX > (this.xRange - this.padding)) {
			newX = this.xRange - this.padding;
		}
		else if (newX < (-this.xRange + this.padding)) {
			newX = -this.xRange + this.padding;
		}

		if (newY > (this.yRange - this.padding)) {
			newY = this.yRange - this.padding;
		}
		else if (newY < (-this.yRange + this.padding)) {
			newY = -this.yRange + this.padding;
		}

		//Compute the new control
		let control = cartesianToPolar(newX - lastX, newY - lastY);

		//Update theta by substracting the current pose
		control.theta -= this.theta;

		//Move to the new position
		this.move({r: control.r, theta: control.theta});

		this.lastControl = {r: control.r, theta: control.theta};

		return this;
	}

	getLastControl() {
		return this.lastControl;
	}
}

export default SimulatedUser;