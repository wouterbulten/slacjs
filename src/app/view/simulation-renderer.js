import ReplayRenderer from './replay-renderer';

class SimulationRenderder extends ReplayRenderer {

	constructor(element, landmarkPositions, xMax = 12, yMax = 12, offsetX = 1.5, offsetY = 1.5) {

		super(element, landmarkPositions, xMax, yMax, offsetX, offsetY);
	}

	/**
	 * Render the particle set and the simulated user
	 * @param  {particleSet} particleSet
	 * @param  {SimulatedUser} user
	 * @return {void}
	 */
	render(particleSet, user) {

		super.render(particleSet);

		this.plotUserTrace(user, '#4100E8', 3);
	}

	/**
	 * Translate x
	 * @param  {Number} x
	 * @return {Number}
	 */
	tx(x) {
		return super.tx(x);
	}

	/**
	 * Translate y
	 * @param  {Number} y
	 * @return {Number}
	 */
	ty(y) {
		return super.ty(y) - 125;
	}
}

export default SimulationRenderder;
