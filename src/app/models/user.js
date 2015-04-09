class User {
	
	/**
	 * Create a new user
	 * @param  {float} options.x     Starting x location of the user
	 * @param  {float} options.y     Starting y location of the user
	 * @param  {float} options.theta Direction of the user in radials relative to (0,0)
	 * @return {User}       
	 */
	constructor({x, y, theta}) {
		this.x = x;
		this.y = y;
		this.theta = theta;

		this.trace = [[x,y,theta]];
	}

	moveUser(r, theta) {
		a = 2;
		this.theta = this.addTheta(theta, this.theta);

	}

	/**
	 * Add two radials
	 * @param {float} t1
	 * @param {float} t2
	 * @return {float} Sum of t1 and t2
	 */
	static addTheta(t1, t2) {
		let theta = t1 + t2;
		const twoPi = Math.PI * 2;

		if(theta > (twoPi)) {
			theta -= twoPi;
		}
		else if(theta < 0) {
			theta += twoPi;
		}

		return theta;
	}
}

export default User;