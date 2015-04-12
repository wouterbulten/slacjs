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