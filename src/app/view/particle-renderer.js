class ParticleRenderer {

	constructor(element, padding = 5, xMaxInit = 10, yMaxInit = 10) {
		this.element = element;
		this.canvas = document.getElementById(element);
		this.ctx = this.canvas.getContext('2d');

		this.padding = padding;
		this.xMax = xMaxInit;
		this.yMax = yMaxInit;

		//Resize the canvas to improve the quality of the render on retina devices
		this._resizeCanvas();
		//Scale canvas to always show the full user path
		this._scaleCanvas();
	}

	render(particleSet) {

		particleSet.particles().forEach((p) => {
			this._plotUserTrace(p.user);
		})
	}

	/**
	 * Plot a user object on the canvas
	 * @param  {User} user
	 * @param  {String} color
	 * @param  {float} Range of the sensor
	 * @return {Visualizer}
	 */
	_plotUserTrace(user, color = '#C7C7C7') {

		this.ctx.lineJoin = 'round';
		this.ctx.lineWidth = 0.1;
		this.ctx.fillStyle = '#960E0E';
		this.ctx.strokeStyle = color;

		this.ctx.beginPath();

		//@todo Find optimisation to only plot parts that have not yet
		//been plotted. We cannot use currentValues() as some particles
		//may have died out while their paths are still present in other particles.
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
	 * Resize the canvas for retina devices
	 * @return {void}
	 */
	_resizeCanvas() {

		const cs = window.getComputedStyle(this.canvas);
   		const width = parseInt(cs.getPropertyValue('width'), 10);
    	const height = parseInt(cs.getPropertyValue('height'), 10);

		//Calcuate a factor for the resolution
		//Use 1.99 scale on retina devices
		const resolutionFactor = window.devicePixelRatio && window.devicePixelRatio === 2 ? 1.99 : 1;

		//Make the canvas smaller with css
		this.canvas.width = width * resolutionFactor;
		this.canvas.height = height * resolutionFactor;
		this.canvas.style.width = width + 'px';
		this.canvas.style.height = height + 'px';
	}

	/**
	 * Scale the canvas
	 * @return {void}
	 */
	_scaleCanvas() {

		const width = this.canvas.width;
		const height = this.canvas.height;

		console.log({width, height})
		//Calculate maximal possible scalefactor
		const scaleXMax = width / this.xMax;
		const scaleYMax = height / this.yMax;

		const scaleFactor = Math.min(scaleXMax, scaleYMax);
		console.log(scaleFactor)

		//Recalculate the xMax and yMax as the screen is not square
		this.yMax = this.yMax * (scaleYMax / scaleFactor);
		this.xMax = this.xMax * (scaleXMax / scaleFactor);

		//Scale the canvas to translate coordinates to pixels
		this.ctx.scale(scaleFactor, scaleFactor);
	}

	_tx(x) {
		return x + (this.xMax / 2);
	}

	_ty(y) {
		return this.yMax - (y + (this.yMax / 2));
	}
}

export default ParticleRenderer;