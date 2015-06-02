import User from '../models/user';
import { randn } from '../util/math';
import { polarToCartesian, cartesianToPolar, addTheta } from '../util/motion';

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
		this.iteration = 0;
	}

	setPath(distances, angles) {
		this.distances = distances;
		this.angles = angles;
	}

	/**
	 * Make a semi-random warlk
	 * @return {SimulatedUser}
	 */
	randomWalk() {
		let {r, theta} = this._newStep();

		//Save the current x,y locally
		const lastX = this.x;
		const lastY = this.y;

		const {dx, dy} = polarToCartesian(r, addTheta(theta, this.theta));

		const newX = this._constrainCoordinate(lastX + dx, this.xRange - this.padding, -this.xRange + this.padding);
		const newY = this._constrainCoordinate(lastY + dy, this.yRange - this.padding, -this.yRange + this.padding);

		//Compute the new control
		let control = cartesianToPolar(newX - lastX, newY - lastY);

		//Move to the new position
		this.move({r: control.r, theta: control.theta});

		this.lastControl = {r: control.r, theta: control.theta};

		return this;
	}

	getLastControl() {
		return this.lastControl;
	}

	/**
	 * Constrain a value using a max,min value
	 * @param  {Number} value
	 * @param  {Number} max
	 * @param  {Number} min
	 * @return {Number}
	 */
	_constrainCoordinate(value, max, min) {
		if (value > max) {
			return max;
		}
		else if (value < min) {
			return min;
		}

		return value;
	}
	/**
	 * Generate a new step
	 * @return {object}
	 */
	_newStep() {
		if (this.distances !== undefined && this.angles !== undefined) {
			if (this.iteration < this.distances.length) {
				const step = {r: this.distances[this.iteration], theta: this.angles[this.iteration]};
				this.iteration++;

				return step;
			}
			else if (this.iteration == this.distances.length) {
				console.debug('Simulater reached end of trace data');

				return {r: 0, theta: 0};
			}

			this.iteration++;
		}

		return {r: Math.abs(randn(this.v, 1)), theta: randn(0.1, 0.2)};
	}
}

export default SimulatedUser;