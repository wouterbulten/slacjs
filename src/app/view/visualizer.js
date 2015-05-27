import { eigenvv } from '../util/math';

class Visualizer {

	/**
	 * Create new visualizer
	 * @param  {String} element Id of the canvas
	 * @param  {Number} xMax
	 * @param  {Number} yMax
	 * @return {Visualizer}
	 */
	constructor(element, xMax, yMax) {
		this.element = element;
		this.xMax = xMax;
		this.yMax = yMax;

		this.canvas = document.getElementById(element);
		this.ctx = this.canvas.getContext('2d');

		this._scaleCanvas();
	}

	/**
	 * Plot the particle set
	 * @param  {ParticleSet} particleSet
	 * @return {Visualizer}
	 */
	plotParticleSet(particleSet) {

		const best = particleSet.bestParticle();

		//Plot user traces
		particleSet.particles().forEach((p) => {
			if (p !== best) {
				this.plotUserTrace(p.user);
			}
		});

		//Plot best last
		this.plotUserTrace(best.user, '#11913E');

		//this.plotLandmarksErrors(best);

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
		this.ctx.lineWidth = 0.1;
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

		if (range !== undefined) {
			this.ctx.strokeStyle = '#C7C7C7';
			this.ctx.beginPath();
			this.ctx.arc(this._tx(user.x), this._ty(user.y), range, 0, Math.PI * 2, true);
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
		const size = 0.35;

		objects.forEach((o) => {

			//Compensate for landmark size
			var x = this._tx(o.x) - (0.35 * size);
			var y = this._ty(o.y) - (0.35 * size);

			this.ctx.fillRect(x, y, size, size);
		});

		return this;
	}

	/**
	 * Plot the predictions of each landmark
	 * @param  {Array} particles
	 * @param  {Array} landmarks
	 * @param  {String} fillStyle
	 * @return {Visualizer}
	 */
	plotLandmarkPredictions(particles, landmarks = undefined, fillStyle = '#941313') {
		this.ctx.fillStyle = fillStyle;
		const size = 0.5;

		particles.forEach((p) => {
			p.landmarks.forEach((l, uid) => {

				//Compensate for landmark size
				const x = this._tx(l.x) - (0.5 * size);
				const y = this._ty(l.y) - (0.5 * size);

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

		return this;
	}

	/**
	 * Plot a landmark initialisation particle set
	 * @param  {LandmarkInitializationSet} landmarkSet
	 * @param  {String} fillStyle
	 * @return {Visualizer}
	 */
	plotLandmarkInitParticles(landmarkSet, fillStyle = '#2EFF3C') {

		this.ctx.fillStyle = fillStyle;
		const size = 0.5;

		for (let set of landmarkSet.particleSets()) {

			set.particles.forEach((p) => {

				//Compensate for landmark size
				const x = this._tx(p.x) - (0.5 * size);
				const y = this._ty(p.y) - (0.5 * size);

				this.ctx.fillRect(x, y, size, size);
			});
		}

		return this;
	}

	/**
	 * Plot elipses of the landmark errors
	 * @param  {Particle} particle
	 * @return {Visualizer}
	 */
	plotLandmarksErrors(particle) {

		particle.landmarks.forEach((l) => {

			const{ values, vectors } = eigenvv(l.cov);

			let major;
			let minor;

			if (values[0] > values[1]) {
				major = [
					vectors[0][0] * Math.sqrt(values[0]),
					vectors[0][1] * Math.sqrt(values[0])
				];
				minor = [
					vectors[1][0] * Math.sqrt(values[1]),
					vectors[1][1] * Math.sqrt(values[1])
				];
			}
			else {
				major = [
					vectors[1][0] * Math.sqrt(values[1]),
					vectors[1][1] * Math.sqrt(values[1])
				];
				minor = [
					vectors[0][0] * Math.sqrt(values[0]),
					vectors[0][1] * Math.sqrt(values[0])
				];
			}

			let beginX = 0;
			let beginY = 0;
			this.ctx.beginPath();
			this.ctx.strokeStyle = '#B06D6D';
			for (let i = 0; i < 16; i++) {

				const r = Math.PI * (i / 8);
				const x = this._tx(minor[0] * Math.cos(r) + major[0] * Math.sin(r) + l.x);
				const y = this._ty(minor[1] * Math.cos(r) + major[1] * Math.sin(r) + l.y);

				if (isNaN(x)) {
					console.log({m0: minor[0], m1: minor[1], mm0: major[0], mm1: major[1]});
					console.log({values, vectors});
				}

				if (i === 0) {
					this.ctx.moveTo(x, y);
					beginX = x;
					beginY = y;
				}
				else {
					this.ctx.lineTo(x, y);
				}
			}

			this.ctx.lineTo(beginX, beginY);
			this.ctx.stroke();
			this.ctx.closePath();
		});

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