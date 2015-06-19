import BaseRenderer from './base-renderer';

class ReplayRenderer extends BaseRenderer {

    /**
     * Renders recorded data
     * @param  {String} element           Canvas element to render to
     * @param  {Object} landmarkPositions True landmark positions
     * @param  {Number} xMax              =             12  Max x coordinates
     * @param  {Number} yMax              =             12  Max y coordinates
     * @param  {Number} offsetX           =             1.5 Offset in x
     * @param  {Number} offsetY           =             1.5 Offset in y
     * @return {ReplayRenderer}
     */
    constructor(element, landmarkPositions, xMax = 12, yMax = 12, offsetX = 1.5, offsetY = 1.5) {

        super(element);

        this.trueLandmarkPositions = landmarkPositions;

        this.xMax = xMax;
        this.yMax = yMax;
        this.offsetX = offsetX;
        this.offsetY = offsetY;

        this.optimizeForRetina();
        this.scaleFactor = this._calculateScaleFactor();
    }

    render(particleSet) {
        this.clearCanvas();

		const best = particleSet.bestParticle();

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

        //Plot the true landmarks
        for (let name in this.trueLandmarkPositions) {
            if (this.trueLandmarkPositions.hasOwnProperty(name)) {

                const landmark =  this.trueLandmarkPositions[name];
                landmark.name = name;

                this.plotObject(landmark, '#000000', 10);
            }
        }

		return this;
    }

	/**
	 * Scale the canvas to zoom in
	 * @return {void}
	 */
	_calculateScaleFactor() {

		const width = this.canvas.width;
		const height = this.canvas.height;

		//Calculate maximal possible scalefactor
		const scaleXMax = width / (this.xMax + this.offsetX);
		const scaleYMax = height / (this.yMax + this.offsetY);

		return Math.min(scaleXMax, scaleYMax);
	}

    /**
	 * Translate x
	 * @param  {Number} x
	 * @return {Number}
	 */
	tx(x) {
		return (x + this.offsetX) * this.scaleFactor;
	}

	/**
	 * Translate y
	 * @param  {Number} y
	 * @return {Number}
	 */
	ty(y) {
		return (this.yMax - (y + this.offsetY)) * this.scaleFactor;
	}

}

export default ReplayRenderer;
