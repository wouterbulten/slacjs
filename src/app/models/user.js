import { addTheta, polarToCartesian } from '../util/coordinate-system';

class User {
	/**
	 * Create a new user
	 * @param  {float} options.x     Starting x location of the user
	 * @param  {float} options.y     Starting y location of the user
	 * @param  {float} options.theta Direction of the user in radials relative to the x-axis
	 * @return {User}
	 */
	constructor({x, y, theta}) {
		this.x = x;
		this.y = y;
		this.theta = theta;

		this.trace = [{x, y, theta}];
	}

	/**
	 * Move a user to a new position
	 * @param  {float} r
	 * @param  {float} theta
	 * @return {User}
	 */
	move(r, theta) {
		const {x, y} = polarToCartesian(r, theta + this.theta);

		this.x += x;
		this.y += y;
		this.theta = addTheta(theta, this.theta);

		this.trace.push({x: this.x, y: this.y, theta: this.theta});

		return this;
	}

}

export default User;