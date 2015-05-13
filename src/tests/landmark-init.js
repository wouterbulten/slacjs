import LandmarkInitializationSet from '../app/models/landmark-init-set';

if (window.test === undefined) {
	window.test = {};
}

/**
 * Pattern that the user walks
 * @yield {Number}
 */
function* walkPattern() {
	const steps = 40;
	const stepSize = 2;
	const quarter = steps / 4;

	for (let i = 0; i < steps; i++) {
		if (i < quarter) {
			yield {dx: stepSize, dy: 0};
		}
		else if (i < (2 * quarter)) {
			yield {dx: 0, dy: stepSize};
		}
		else if (i < (3 * quarter)) {
			yield {dx: -stepSize, dy: 0};
		}
		else if (i < steps) {
			yield {dx: 0, dy: -stepSize}; 
		}
	}
}

window.test.landmarkInit = {

	landmarkSet: undefined,
	userX: 0,
	userY: 0,
	lX: 0,
	lY: 0,
	userTrace: [],
	xMax: 50,
	yMax: 50,
	ctx: undefined,
	canvas: undefined,

	pattern: undefined,

	initialize: function() {

		//Init random landmark
		this.lX = Math.random() * 30 - 15;
		this.lY = Math.random() * 30 - 15;

		this.landmarkSet = new LandmarkInitializationSet();
		this.canvas = document.getElementById('test-content');
		this.ctx = this.canvas.getContext('2d');
		this.ctx.scale(10, 10);

		this.userTrace.push({x: this.userX, y: this.userY});

		this.pattern = walkPattern();
	},

	iterate: function() {

		const {dx, dy} = this.pattern.next().value;

		this.userX = this.userX + dx;
		this.userY = this.userY + dy;
		console.log({dx, dy})
		this.userTrace.push({x: this.userX, y: this.userY});

		const r = Math.sqrt(Math.pow(this.lX - this.userX, 2) + Math.pow(this.lY - this.userY, 2));

		this.landmarkSet.addMeasurement('uid', this.userX, this.userY, r);

		this._draw();
		console.debug(`True r: ${r}`);
	},

	_draw: function() {

		this.ctx.clearRect (0, 0, this.canvas.width, this.canvas.height);
		this.ctx.fillStyle = '#000000';

		this.landmarkSet.particles.get('uid').particles.forEach((p) => {

			const x = this._tx(p.x);
			const y = this._ty(p.y);

			this.ctx.fillRect(x, y, 0.3, 0.3);
		});

		this.ctx.fillStyle = '#ff0000';
		this.userTrace.forEach((t) => this.ctx.fillRect(this._tx(t.x), this._ty(t.y), 0.5, 0.5));

		this.ctx.fillStyle = '#00ff00';
		this.ctx.fillRect(this._tx(this.lX), this._ty(this.lY), 0.5, 0.5);
	},

	_tx: function(x) {
		return x + (this.xMax / 2);
	},

	_ty: function(y) {
		return this.yMax - (y + (this.yMax / 2));
	}
};