class ParticleRenderer {

	constructor(element, padding = 10, xMaxInit = 10, yMaxInit = 10) {
		this.element = element;
		this.canvas = document.getElementById(element);
		this.ctx = this.canvas.getContext('2d');

		this.padding = padding;
		this.xMax = xMaxInit;
		this.yMax = yMaxInit;

		//Resize the canvas to improve the quality of the render on retina devices
		this._resizeCanvas();
	}

	render() {

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

		//Calculate maximal possible scalefactor
		const scaleXMax = width / (this.xMax + 2 * this.padding);
		const scaleYMax = height / (this.yMax + 2 * this.padding);

		const scaleFactor = Math.min(scaleXMax, scaleYMax);

		//Scale the canvas to translate coordinates to pixels
		this.ctx.scale(scaleFactor, scaleFactor);
	}
}

export default ParticleRenderer;