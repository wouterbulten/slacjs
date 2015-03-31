var Particle = function(x,y,r) {

	this.x = x;
	this.y = y;
	this.r = r;
	this.w = 0;

	/**
	 *  List of landmark estimates over time
	 * @type {Object}
	 */
	this.landmarks = {};

	this.trace = [[x,y,r]];

	this.iteration = 0;
};

Particle.prototype.sample = function(control) {
	
	// P(x_t | x_{t-1} , control )

	xPrevious = this.x;
	yPrevious = this.y;
	rPrevious = this.r;

	//Sample here
	this.x = xPrevious + control[0] + MathAdapter.randn(0,2);
	this.y = yPrevious + control[1] + MathAdapter.randn(0,2);

	this.r = control[2] + (MathAdapter.randn(0,1));
	
	this.trace.push([this.x, this.y, this.r]);

	this.iteration++;

};

Particle.prototype.resample = function(first_argument) {
	// body...
};


Particle.prototype.landmarkUpdate = function(measurements) {
	
	//Measurements is a list of {id: landmark, value: rssi} values

	for(var i = 0; i < measurements.length; i++)
	{
		var z = measurements[i]

		if(this.landmarks[z.id] == undefined) {
			this.initLandmark(z.id, z.value);
		}
		else {
			this.updateLandmark(z.id, z.value);
		}
	}
};

Particle.prototype.initLandmark = function(j, z) {
	
	var means = [0,0];
	var covariance = [[0,0], [0,0]];

	// mean = inverse of observation function
};

Particle.prototype.updateLandmark = function(j, z) {
	// body...
};

/**
 * Compute the weight of this particle
 * @return {float}
 */
Particle.prototype.computeWeight = function() {
	
	return 0.1;
};

/**
 * Clone a particle by replacing the internal state with values
 * from a second particle.
 * @param  {Particle} original
 * @return {void}
 */
Particle.prototype.cloneParticle = function(original) {
		this.x = original.x;
		this.y = original.y;
		this.r = original.r;
		this.w = 0;
		this.iteration = original.iteration;

		this.trace = original.trace.slice();
};