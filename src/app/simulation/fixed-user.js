import User from '../models/user';

export default class FixedUser extends User {

	constructor(position, path) {
		super(position);

		this.iteration = 0;
		this.path = path;
		this.lastControl = {r: 0, theta: 0};
	}

	walk() {

		if (this.iteration >= this.path.length) {
			return;
		}

		this.move(this.path[this.iteration]);
		this.lastControl = this.path[this.iteration];

		this.iteration++;
	}

	getLastControl() {
		return {r: 1, theta: 0};
	}
}
