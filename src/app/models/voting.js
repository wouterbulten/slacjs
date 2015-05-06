class VoteAccumulator {

	/**
	 * Create new voting system
	 * @param  {Number} startX    Center of the voting matrix
	 * @param  {Number} startY    Center of the voting matrix
	 * @param  {Number} dimension Size of the voting matrix coordinate system
	 * @param  {Number} precision Defines amount of cells by dimension/precision
	 * @return {VoteAccumulator}
	 */
	constructor(startX = 0, startY = 0, dimension = 55, precision = 5) {
		
		this.dimension = dimension;
		this.precision = precision;
		this.centerX = startX;
		this.centerY = startY;

		const size = Math.round(dimension / precision);

		this.votes = new Array(size).fill(0).map(() => new Array(size).fill(0));
	}

	addMeasurement(x, y, r) {

		x = x - this.centerX;
		y = y - this.centerY;

		if (!this._inRange(x, y)) {
			console.error("Coordinates not in range of VoteAccumulator internal cell matrix.");
		}

		//Get the current center
		const {row, column} = this._cartesianToCell(x, y);

		//Convert the range to cell distance
		const dist = Math.round(r / this.precision);

		if (!this._inRange(x+dist, y) || !this._inRange(x, y+dist)) {
			console.error("Range measurement not in range of VoteAccumulator internal cell matrix.");
		}

		//Add votes according to midpoint circle algorithm
		this._midpointCircle(row, column, dist);

		return this;
	}

	/**
	 * Return a string representation of the vote matrix
	 * @return {String}
	 */
	toString() {
		return this.votes.reduce((output, row) => output + row.join(' ') + '\n', '\n');
	}

	/**
	 * Return true when an cartesian coordinate is in range
	 * @param  {Number} x
	 * @param  {Number} y
	 * @return {Boolean}
	 */
	_inRange(x, y) {
		return (
				x >= (-0.5 * this.dimension)
			&&	x <= (0.5 * this.dimension)
			&&	y >= (-0.5 * this.dimension)
			&&	y <= (0.5 * this.dimension)
		);
	}

	_midpointCircle(row, column, r) {

		let x = r;
		let y = 0;
		let radiusError = 1 - x;

		while (x >= y) {
			this._vote( y + row,  x + column);
			this._vote( x + row,  y + column);
			this._vote( y + row, -x + column);
			this._vote( x + row, -y + column);
			this._vote(-y + row, -x + column);
			this._vote(-x + row, -y + column);
			this._vote(-y + row,  x + column);
			this._vote(-x + row,  y + column);

			y++;

			if (radiusError < 0) {
				radiusError += 2 * y + 1;
			}
			else {
				x--;
				radiusError += 2 * (y - x) + 1;
			}
		}
		
		//At the ends of the cross, we have double votes, substract these
		this._vote(row + r, column, -1)
		this._vote(row - r, column, -1)
		this._vote(row, column + r, -1)
		this._vote(row, column - r, -1)

		//Fix errors at 45deg
		const qPi = Math.PI / 4;
		const aX = Math.round(Math.cos(qPi) * r);
		const aY = Math.round(Math.sin(qPi) * r);
		/*this._vote(row + aY, column + aX, -1);
		this._vote(row + aY, column - aX, -1);
		this._vote(row - aY, column + aX, -1);
		this._vote(row - aY, column - aX, -1);*/
	}

	/**
	 * Increase votes at a specific cell
	 * @param  {Number} row
	 * @param  {Number} column
	 * @return {void}
	 */
	_vote(row, column, value = 1) {
		this.votes[row][column] += value;
	}

	/**
	 * Convert a cartesian coordinate to a specific cell
	 * @param  {float} x
	 * @param  {float} y
	 * @return {object}
	 */
	_cartesianToCell(x, y) {
		return {
			column: Math.floor((x + (0.5 * this.dimension)) / this.precision),
			row: Math.floor((y + (0.5 * this.dimension)) / this.precision)
		};
	}

	/**
	 * Convert a cell to cartesian coordinates
	 * @param  {int} row
	 * @param  {int} column
	 * @return {object}
	 */
	_cellToCartesian(row, column) {
		return {
			x: ((column + 0.5) * this.precision) - (0.5 * this.dimension),
			y: ((row + 0.5) * this.precision) - (0.5 * this.dimension)
		};
	}
}

export default VoteAccumulator;