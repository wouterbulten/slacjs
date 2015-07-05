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
			this.lastControl = {r: 0, theta: 0};
			return false;
		}

		this.move(this.path[this.iteration]);
		this.lastControl = this.path[this.iteration];

		this.iteration++;

		return true;
	}

	getLastControl() {
		return this.lastControl;
	}
}
