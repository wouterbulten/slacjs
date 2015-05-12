import LandmarkInitializationSet from '../models/landmark-init-set';

if (window.test === undefined) {
	window.test = {};
}

window.test.landmarkInit = {

	landmarkSet: undefined,
	userX: 0,
	userY: 0,
	lX: 5,
	lY: 7.5,
	xMax: 50,
	yMax: 50,
	ctx: undefined,

	initialize: function() {
		this.landmarkSet = new LandmarkInitializationSet();
		this.ctx = document.getElementById("test-content").getContext('2d');
		this.ctx.scale(10,10);
	},

	iterate: function() {

		this.userX = this.userX + Math.random();
		this.userY = this.userY + Math.random() * 2;

		const r = Math.sqrt(Math.pow(this.lX - this.userX, 2) + Math.pow(this.lY - this.userY, 2))

		this.landmarkSet.addMeasurement('uid', this.userX, this.userY, r);

		this._draw();
	},

	_draw: function() {
		

		this.ctx.fillStyle = '#000000';

		this.landmarkSet.particles.get('uid').particles.forEach((p) => {
			
			const x = this._tx(p.x);
			const y = this._ty(p.y);

			this.ctx.fillRect(x, y, 0.3, 0.3);
		});

		this.ctx.fillStyle = '#ff0000';
		this.ctx.fillRect(this._tx(this.userX), this._ty(this.userY), 0.5, 0.5);

		this.ctx.fillStyle = '#00ff00';
		this.ctx.fillRect(this._tx(this.lX), this._ty(this.lY), 0.5, 0.5);
	},

	_tx: function(x) {
		return x + (this.xMax / 2);
	},

	_ty: function(y) {
		return this.yMax - (y + (this.yMax / 2));
	}
}