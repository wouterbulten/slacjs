import VoteAccumulator from '../models/vote-accumulator';

if (window.test === undefined) {
	window.test = {};
}

window.test.voting = {

	votes: undefined,
	userX: 0,
	userY: 0,
	trace: [],

	lX: -5,
	lY: 10,

	lR: 0,
	lC: 0,

	initialize: function() {
		this.votes = new VoteAccumulator(75, 1);

		const {row, column} = this.votes._cartesianToCell(this.lX, this.lY);
		this.lR = row;
		this.lC = column;

		//Create a table to show the votes
		document.getElementById('test-content').innerHTML = this._createOutputTable();
		this._displayLandmark();
	},

	iterate: function() {

		this.userX += Math.random() * 4 - 2;
		this.userY += Math.random() * 6 - 3;

		this.trace.push({x: this.userX, y: this.userY});

		const r = Math.sqrt(Math.pow(this.lX - this.userX, 2) + Math.pow(this.lY - this.userY, 2)) + (Math.random() * 6 - 3);

		this.votes.addMeasurement(this.userX, this.userY, r);

		document.getElementById('test-content').innerHTML = '';
		document.getElementById('test-content').innerHTML = this._createOutputTable();
		this._displayLandmark();
		this._displayUser();
	},

	_createOutputTable: function() {

		let table = '<table>';

		table += this.votes.votes.reduce((output, row, rowN) => {
			return output
					+ '<tr>'
					+ row.reduce((rowOutput, cell, columnN) => {
						const color = 'background-color: rgba(0, 0, 0, ' + (cell / 50) + ');';
						const id = rowN + '' + columnN;

						return rowOutput + 
								'<td id="' + id + '" style="' + color + '">' 
								+ cell + 
								'</td>';
					}, '')
					+ '</tr>';
		}, '');

		table += '</table>';
		console.log(table)
		return table;
	},

	_displayLandmark: function() {
		document.getElementById(this.lR + '' + this.lC).style.backgroundColor = 'red';
	},
	_displayUser: function() {
		this.trace.forEach((pos) => {
			const {row, column} = this.votes._cartesianToCell(pos.x, pos.y);

			document.getElementById(row + '' + column).style.backgroundColor = 'green';
		});
	}
};