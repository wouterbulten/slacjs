var Sensor = function() {

};

Sensor.prototype.readingToPosition = function(measurement) {
	console.error('Not implemented');
};

/**
 * Constructor for RangeBearingSensor
 */
function RangeBearingSensor() {
	Sensor.call(this);
}

//Extend Sensor object
RangeBearingSensor.prototype = Object.create(Sensor.prototype);

RangeBearingSensor.prototype.readingToPosition = function(x, y, measurement) {
	


};