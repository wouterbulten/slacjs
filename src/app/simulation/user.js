import User from '../models/user';
import { randn } from '../util/math';

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
	}

	/**
	 * Make a semi-random warlk
	 * @return {SimulatedUser}
	 */
	randomWalk() {
		const distance = Math.max(randn(this.v, 2), 0);

		this.move(distance, 0.2);

		//Constrain the user position
		if (this.x > (this.xRange - this.padding)) {
			this.x = this.xRange - this.padding;

		}
		else if (this.x < (-this.xRange + this.padding)) {
			this.x = -this.xRange + this.padding;
		}

		if (this.y > (this.yRange - this.padding)) {
			this.y = this.yRange - this.padding;
		}
		else if (this.y < (-this.yRange + this.padding)) {
			this.y = -this.yRange + this.padding;
		}

		//Update the trace to be sure
		this.trace.last().x = this.x;
		this.trace.last().y = this.y;

		return this;
	}
}

export default SimulatedUser;