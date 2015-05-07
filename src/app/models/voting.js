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

		this.measurements = 0;
		this.size = Math.round(dimension / precision);

		this.votes = new Array(this.size).fill(0).map(() => new Array(this.size).fill(0));
	}

	addMeasurement(x, y, r) {

		this.measurements++;

		x = x - this.centerX;
		y = y - this.centerY;

		if (!this._inRange(x, y)) {
			console.error('Coordinates not in range of VoteAccumulator internal cell matrix.');
		}

		if (!this._inRange(x + r, y) || !this._inRange(x, y + r)) {
			console.error('Range measurement not in range of VoteAccumulator internal cell matrix.');
		}

		//Get the current center
		const {row, column} = this._cartesianToCell(x, y);

		//Convert the range to cell distance
		const dist = Math.round(r / this.precision);

		//Add votes according to midpoint circle algorithm
		this._midpointCircle(row, column, dist);

		return this;
	}

	positionEstimate() {
		if(this.measurements < 3) {
			return {};
		}

		let firstValue = 0;
		let firstCell = {};
		let secondValue = 0;
		let secondCell = {};

		for (let row = 0; row < this.size; row++) {
			for (let column = 0; column < this.size; column++) {
				if (this.votes[row][column] > firstValue) {
					firstValue = this.votes[row][column];
					firstCell = {row, column};
				}
				else if (this.votes[row][column] > secondValue) {
					secondValue = this.votes[row][column];
					secondCell = {row, column};
				}
			}
		}
		console.log({f: firstValue, s: secondValue})
		if((firstValue / (firstValue + secondValue)) > 0.6) {
			return firstCell;
		}

		return {};
	}

	/**
	 * Return a string representation of the vote matrix
	 * @return {String}
	 */
	toString() {
		return this.votes.reduce((output, row) => {
			return output + row.reduce((rowOutput, cell) => {
				if(cell > 9) {
					return rowOutput + cell + ' ';
				}
				else {
					return rowOutput + cell + '  ';
				}
			}) + '\n';
		}, '\n');
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

	/**
	 * Place votes based on the midpoint circle algorithm
	 * @param  {Number} row    Center
	 * @param  {Number} column Center
	 * @param  {Number} r      Radius
	 * @return {void}
	 */
	_midpointCircle(row, column, r) {

		let x = r;
		let y = 0;
		let radiusError = 1 - x;

		while (x >= y) {
			this._vote( y + row,  x + column);
			this._vote( y + row, -x + column);
			this._vote(-y + row, -x + column);
			this._vote(-y + row,  x + column);
			
			if (x != y) {
				this._vote( x + row,  y + column);
				this._vote( x + row, -y + column);
				this._vote(-x + row, -y + column);
				this._vote(-x + row,  y + column);
			}

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
		this._vote(row + r, column, -1);
		this._vote(row - r, column, -1);
		this._vote(row, column + r, -1);
		this._vote(row, column - r, -1);
	}

	/**
	 * Increase votes at a specific cell
	 * @param  {Number} row
	 * @param  {Number} column
	 * @return {void}
	 */
	_vote(row, column, value = 1) {

		if(row >= this.size || column >= this.size) {
			return;
		}

		this.votes[row][column] += 2 * value;

		if (row > 0) {
			this.votes[row - 1][column] += value;

			if (column > 0) {
				this.votes[row - 1][column - 1] += value;
			}
			if (column < (this.size - 1)) {
				this.votes[row - 1][column + 1] += value;
			}
		}

		if (row < (this.size - 1)) {
			this.votes[row + 1][column] += value;

			if (column > 0) {
				this.votes[row + 1][column - 1] += value;
			}
			if (column < (this.size - 1)) {
				this.votes[row + 1][column + 1] += value;
			}
		}

		if (column > 0) {
			this.votes[row][column - 1] += value;
		}

		if (column < (this.size - 1)) {
			this.votes[row][column + 1] += value;
		}
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