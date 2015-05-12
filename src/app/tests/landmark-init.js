import LandmarkInitializationSet from '../models/landmark-init-set';

if (window.test === undefined) {
	window.test = {};
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

	initialize: function() {

		//Init random landmark
		this.lX = Math.random() * 50 - 25;
		this.lY = Math.random() * 50 - 25;
		
		this.landmarkSet = new LandmarkInitializationSet();
		this.canvas = document.getElementById("test-content");
		this.ctx = this.canvas.getContext('2d');
		this.ctx.scale(10,10);

		this.userTrace.push({x: this.userX, y: this.userY});
	},

	iterate: function() {

		this.userX = this.userX + Math.random();
		this.userY = this.userY + Math.random() * 2;

		this.userTrace.push({x: this.userX, y: this.userY});

		const r = Math.sqrt(Math.pow(this.lX - this.userX, 2) + Math.pow(this.lY - this.userY, 2))

		this.landmarkSet.addMeasurement('uid', this.userX, this.userY, r);

		this._draw();
	},

	_draw: function() {
		
		this.ctx.clearRect ( 0 , 0 , this.canvas.width, this.canvas.height );
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
}