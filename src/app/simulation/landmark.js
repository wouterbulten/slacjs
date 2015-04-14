class SimulatedLandmarkSet {

	constructor(N, xRange, yRange) {
		this.landmarks = [];
		this.xRange = xRange;
		this.yRange = yRange;

		for (let i = 0; i < N; i++) {
			this.landmarks.push(this._randomLandmark('landmark-' + i));
		}
	}

	_randomLandmark(uid) {
		return {
			id: uid,
			x: Math.random() * (2 * this.xRange) - this.xRange,
			y: Math.random() * (2 * this.yRange) - this.yRange
		};
	}
}

export default SimulatedLandmarkSet;