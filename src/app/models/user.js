import { polarToCartesian } from '../util/motion';
import LinkedList from '../util/linked-list';

class User {
	/**
	 * Create a new user
	 * @param  {float} options.x     Starting x location of the user
	 * @param  {float} options.y     Starting y location of the user
	 * @param  {float} options.theta Direction of the user in radials relative to the x-axis
	 * @param  {LinkedList} trace 	 Optional trace to extend
	 * @return {User}
	 */
	constructor({x, y, theta}, trace = undefined) {
		this.x = x;
		this.y = y;
		this.theta = theta;

		if (trace === undefined) {
			this.trace = new LinkedList().add({x, y, theta});
		}
		else {
			//We use a LinkedList here to make use of the reference to the
			//trace instead of copying the whole list
			this.trace = new LinkedList(trace);
		}
	}

	/**
	 * Move a user to a new position
	 * @param  {float} r
	 * @param  {float} theta
	 * @return {User}
	 */
	move({r, theta}) {

		const {dx, dy} = polarToCartesian(r, theta);

		this.x += dx;
		this.y += dy;
		this.theta = theta;

		this.trace.add({x: this.x, y: this.y, theta: this.theta});

		return this;
	}

	/**
	 * Safely copy a user object
	 * @param  {User} user User to copy
	 * @return {User}
	 */
	static copyUser(user) {
		return new User({
			x: user.x,
			y: user.y,
			theta: user.theta
		}, user.trace);
	}
}

export default User;