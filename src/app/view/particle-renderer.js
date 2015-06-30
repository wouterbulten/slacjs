import BaseRenderer from './base-renderer';

class ParticleRenderer extends BaseRenderer {

	/**
	 * Renders data with an auto increasing canvas (by down scaling)
	 * @param  {String} element canvas element to render to
	 * @return {ParticleRenderer}
	 */
	constructor(element, height) {
		super(element);

		this.offsetX = 0;
		this.offsetY = 0;

		this.padding = 2;
		this.scaleFactor = undefined;
		this.maxScaleFactor = 200;

		this.optimizeForRetina(height);
	}

	render(particleSet) {
		this.clearCanvas();

		const best = particleSet.bestParticle();

		//Compute the offset based on the best particle
		//This makes sure everything is >0
		//(use only the best for performance)
		this.updateOffsets(best.user, best.landmarks);

		//Compute a scale factor based on the new coordinates
		//of the best user
		this.updateScaleFactor(best.user, best.landmarks);

		particleSet.particles().forEach((p) => {

			if (p === best) {
				return;
			}

			this.plotUserTrace(p.user, '#CCCCCC', 0.5);
		});

		//Plot any landmark init filters
		let color = 50;

		particleSet.landmarkInitSet.particleSetMap.forEach((landmarkPf) => {
			landmarkPf.particles.forEach((p) => {
				this.plotObject(p, 'rgb(0,' + color + ',0)', 5);
			});

			color += 50;
		});

		//Plot the best user trace
		this.plotUserTrace(best.user, '#24780D');

		//Plot the landmarks of the best particle
		best.landmarks.forEach((landmark) => {
			this.plotObject(landmark, '#B52B2B', 10);
		});
	}

	/**
	 * Calculate the new maximum scale factor
	 * @param  {Object} user
	 * @param  {Object} landmark
	 * @return {void}
	 */
	updateOffsets(user, landmarks) {
		const valuesX = [];
		const valuesY = [];

		user.trace.values().forEach(({x, y, theta}) => {
			valuesX.push(x);
			valuesY.push(y);
		});

		landmarks.forEach((l) => {
			valuesX.push(l.x);
			valuesY.push(l.y);
		});

		const minX = Math.min(...valuesX);
		const minY = Math.min(...valuesY);

		if (minX < 0) {
			this.offsetX = -1 * minX;
		}

		if (minY < 0) {
			this.offsetY = -1 * minY;
		}
	}

	/**
	 * Calculate the new maximum scale factor
	 * @param  {Object} user
	 * @return {void}
	 */
	updateScaleFactor(user, landmarks) {

		let maxX = 0;
		let maxY = 0;

		user.trace.values().forEach(({x, y, theta}) => {
			if ((x + this.offsetX) > maxX) {
				maxX = x + this.offsetX;
			}

			if ((y + this.offsetY) > maxY) {
				maxY = y + this.offsetY;
			}
		});

		landmarks.forEach((p) => {
			if ((p.x + this.offsetX) > maxX) {
				maxX = p.x + this.offsetX;
			}

			if ((p.y + this.offsetY) > maxY) {
				maxY = p.y + this.offsetY;
			}
		});

		//Calculate a new scalefactor
		//Never take a higher value as this will result in flickering
		if (this.scaleFactor === undefined) {
			this.scaleFactor = Math.min(
				this.calculateScaleFactor(maxX + (2 * this.padding), maxY + (2 * this.padding)),
				this.maxScaleFactor
			);
		}
		else {
			this.scaleFactor = Math.min(
				this.scaleFactor,
				this.calculateScaleFactor(maxX + (2 * this.padding), maxY + (2 * this.padding))
			);
		}
	}

    /**
	 * Translate x
	 * @param  {Number} x
	 * @return {Number}
	 */
	tx(x) {
		return (x + this.offsetX + this.padding) * this.scaleFactor;
	}

	/**
	 * Translate y
	 * @param  {Number} y
	 * @return {Number}
	 */
	ty(y) {
		return this.canvas.height - ((y + this.offsetY + this.padding) * this.scaleFactor);
	}
}

export default ParticleRenderer;
