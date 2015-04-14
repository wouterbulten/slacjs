class Visualizer {

	constructor(element, xMax, yMax, dpi = 1) {
		this.element = element;
		this.dpi = dpi;
		this.xMax = xMax;
		this.yMax = yMax;

		this.canvas = document.getElementById(element);
		this.ctx = this.canvas.getContext('2d');

		if (dpi > 1) {
			this._scaleCanvas();
		}
	}

	plotParticleSet(particleSet) {

		//Plot user traces
		particleSet.particles().forEach((p) => this._plotUserTrace(p.user));

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

	_plotUserTrace(user) {
		//@todo This can possibly be optimised by only plotting traces that have
		//		not yet been plotted.

		this.ctx.lineJoin = 'round';
		this.ctx.lineWidth = 0.1;
		this.ctx.fillStyle = '#960E0E';
		this.ctx.strokeStyle = '#C7C7C7';

		//Particles always start at 0,0 but we want to center the start
		const baseX = this.xMax / 2;
		const baseY = this.yMax / 2;

		this.ctx.beginPath();

		user.trace.values().forEach(({x, y, theta}, i) => {

			if (i === 0) {
				this.ctx.moveTo(baseX + x, baseY + y);
			}
			else {
				this.ctx.lineTo(baseX + x, baseY + y);
			}
		});

		this.ctx.stroke();
		this.ctx.closePath();
	}

	/**
	 * Scale the canvas
	 * @return {void}
	 */
	_scaleCanvas() {
		//Get desired width of the canvas
		const width = this.dpi * Math.min(window.innerWidth, window.innerHeight);
		const scaledWidth = this.dpi * width;

		//Make the canvas smaller with css
		this.canvas.width = scaledWidth;
		this.canvas.height = scaledWidth;
		this.canvas.style.width = width + 'px';
		this.canvas.style.height = width + 'px';

		var scaleFactorX = width / this.xMax;
		var scaleFactorY = width / this.yMax;

		//Scale the canvas to translate coordinates to pixels
		this.ctx.scale(scaleFactorX, scaleFactorY);
	}
}

export default Visualizer;