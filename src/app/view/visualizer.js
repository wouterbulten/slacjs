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

		const best = particleSet.bestParticle();

		//Plot user traces
		particleSet.particles().forEach((p) => {
			if(p !== best) {
				this.plotUserTrace(p.user)
			}
		});

		//Plot best last
		this.plotUserTrace(best.user, '#11913E')

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
	 * @param  {float} Range of the sensor
	 * @return {Visualizer}
	 */
	plotUserTrace(user, color = '#C7C7C7', range = undefined) {
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

		if (range !== undefined)
		{
			this.ctx.strokeStyle = '#C7C7C7';
			this.ctx.beginPath();
			this.ctx.arc(this._tx(user.x), this._ty(user.y), range, 0, Math.PI*2,true);
			this.ctx.stroke();
			this.ctx.closePath();
		}

		return this;
	}

	/**
	 * Plot a set of objects as squares
	 * @param {Array} objects An array of objects with at least an x,y value
	 * @param {string} fillStyle
	 * @return {Visualizer}
	 */
	plotObjects(objects, fillStyle = '#000000') {
		this.ctx.fillStyle = fillStyle;
		const size = 0.5;

		objects.forEach((o) => {

			//Compensate for landmark size
			var x = this._tx(o.x) - (0.5 * size);
			var y = this._ty(o.y) - (0.5 * size);

			this.ctx.fillRect(x, y, size, size);
		});

		return this;
	}

	plotLandmarkPredictions(particles, landmarks = undefined, fillStyle = '#941313') {
		this.ctx.fillStyle = fillStyle;
		const size = 0.5;

		particles.forEach((p) => {
			p.landmarks.forEach((l, uid) => {

				//Compensate for landmark size
				var x = this._tx(l.x) - (0.5 * size);
				var y = this._ty(l.y) - (0.5 * size);

				this.ctx.fillRect(x, y, size, size);

				if (landmarks !== undefined) {
					const trueL = landmarks.landmarkByUid(uid);

					this.ctx.strokeStyle = '#8C7A7A';
					this.ctx.beginPath();
					this.ctx.moveTo(x, y);
					this.ctx.lineTo(this._tx(trueL.x), this._ty(trueL.y));
					this.ctx.stroke();
					this.ctx.closePath();
				}
			});
		});
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