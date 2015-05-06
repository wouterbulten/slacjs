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

		this.votes = new Array(size).fill(0).map(() => new Uint8Array(size));
	}

	addMeasurement(x, y, r) {

		x = x - this.centerX;
		y = y - this.centerY;

		if (!this._inRange(x, y)) {
			console.error("Coordinates not in range of VoteAccumulator internal cell matrix.");
		}

		const {row, column} = this._cartesianToCell(x, y);

		return this;
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