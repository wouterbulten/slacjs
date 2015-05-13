import VoteAccumulator from './vote-accumulator';

class VoteSet {
	constructor(dimension = 100, precision = 5) {
		this.dimension = dimension;
		this.precision = precision;

		this.voteAccumulators = new Map();
	}

	addMeasurement(uid, x, y, r) {
		if (!this.has(uid)) {
			this.voteAccumulators.set(uid, new VoteAccumulator(this.dimension, this.precision, x, y));
		}

		this.voteAccumulators.get(uid).addMeasurement(x, y, r);

		return this;
	}

	has(uid) {
		return this.voteAccumulators.has(uid);
	}

	estimate(uid) {
		return this.voteAccumulators.get(uid).positionEstimate();
	}

	remove(uid) {
		this.voteAccumulators.remove(uid);
	}
}

export default VoteSet;