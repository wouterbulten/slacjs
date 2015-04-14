class Visualizer {

	constructor(element, xMax, yMax) {
		this.element = element;
		this.xMax = xMax;
		this.yMax = yMax;

		this.canvas = document.getElementById(element);
		this.ctx = this.canvas.getContext('2d');

		this._scaleCanvas();
	}

	plotParticleSet(particleSet) {

		//Plot user traces
		particleSet.particles().forEach((p) => this.plotUserTrace(p.user));

		return this;
	}

	/**
	 * Clear the canvas
	 * @return {Visualizer}
	 */
	clearCanvas() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		return this;
	}

	/**
	 * Plot a user object on the canvas
	 * @param  {User} user
	 * @param  {String} color
	 * @return {Visualizer}
	 */
	plotUserTrace(user, color = '#C7C7C7') {
		//@todo This can possibly be optimised by only plotting traces that have
		//		not yet been plotted.

		this.ctx.lineJoin = 'round';
		this.ctx.lineWidth = .1;
		this.ctx.fillStyle = '#960E0E';
		this.ctx.strokeStyle = color;

		this.ctx.beginPath();

		user.trace.values().forEach(({x, y, theta}, i) => {

			if (i === 0) {
				this.ctx.moveTo(this._tx(x), this._ty(y));
			}
			else {
				this.ctx.lineTo(this._tx(x), this._ty(y));
			}
		});

		this.ctx.stroke();
		this.ctx.closePath();

		return this;
	}

	/**
	 * Scale the canvas
	 * @return {void}
	 */
	_scaleCanvas() {
		//Use 1.99 scale on retina devices
		const scaleFactor = window.devicePixelRatio && window.devicePixelRatio === 2 ? 1.99 : 1;
		//Get desired width of the canvas
		const width = Math.min(window.innerWidth, window.innerHeight);

		//Make the canvas smaller with css
		this.canvas.width = width * scaleFactor;
		this.canvas.height = width * scaleFactor;
		this.canvas.style.width = width + 'px';
		this.canvas.style.height = width + 'px';

		var scaleFactorX = (width * scaleFactor) / this.xMax;
		var scaleFactorY = (width * scaleFactor) / this.yMax;

		//Scale the canvas to translate coordinates to pixels
		this.ctx.scale(scaleFactorX, scaleFactorY);
	}

	_tx(x) {
		return x + (this.xMax / 2);
	}

	_ty(y) {
		return this.yMax - (y + (this.yMax / 2));
	}
}

export default Visualizer;