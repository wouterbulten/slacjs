import { polarToCartesian, meanHeading, limitTheta } from '../util/motion';
import { randn } from '../util/math';
import LinkedList from '../util/linked-list';

class User {
	/**
	 * Create a new user
	 * @param  {float} options.x     Starting x location of the user
	 * @param  {float} options.y     Starting y location of the user
	 * @param  {float} options.theta Direction of the user in radials relative to the x-axis
	 * @param  {object} userConfig
	 * @param  {LinkedList} trace 	 Optional trace to extend
	 * @return {User}
	 */
	constructor({x, y, theta}, userConfig, trace = undefined) {
		this.x = x;
		this.y = y;
		this.theta = theta;
		this.userConfig = userConfig;

		this.previousOdometry = {x, y, theta};

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
	 * Move the user to a specific position using a sampling function
	 * @param  {Number} x
	 * @param  {Number} y
	 * @param  {Number} theta
	 * @return {User}
	 */
	samplePose({r, theta}) {

		const sdHeading = this.userConfig.sdHeading;

		const sampledHeading = limitTheta(randn(theta, sdHeading));

		//Comput the deviation of the noise of the step size
		//@todo Base the deviation of the steps on the pedometer
		const sdStep = this.userConfig.sdStep;

		const sampledR = randn(r, sdStep);

		//Use odometry to find a new position
		const {dx, dy} = polarToCartesian(sampledR, sampledHeading);

		this.x += dx;
		this.y += dy;
		this.theta = sampledHeading;

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
		}, user.userConfig, user.trace);
	}
}

export default User;
