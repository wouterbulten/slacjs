/**
 * Landmark
 * Todo: refactor to use config object
 * @param {[type]}
 * @param {[type]}
 * @param {[type]}
 * @param {[type]}
 * @param {[type]}
 * @param {[type]}
 * @param {[type]}
 * @param {[type]}
 */
var Landmark = function(name, id, x, y, n, txPower, noise, range) {

	this.name = name;
	this. id = id;
	this.x = x;
	this.y = y;
	this.n = n;
	this.txPower = txPower;
	this.noise = noise;
	this.range = range;
}

Landmark.prototype.distance = function(x,y) {
	return Math.sqrt(Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2))
}

Landmark.prototype.rssiAtLocationRaw = function(x, y) {
	return -(10 * this.n) *  MathAdapter.log(Math.max(this.distance(x,y), 0.1), 10) + this.txPower
}

Landmark.prototype.rssiAtLocation = function(x,y) {
	return this.rssiAtLocationRaw(x,y) + MathAdapter.randn(0, this.noise)
}

Landmark.prototype.inRange = function(x,y) {
	return this.distance(x,y) < this.range;
};