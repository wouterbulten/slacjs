var Particle = function(x,y,theta) {

	this.x = x;
	this.y = y;
	this.theta = theta;
	this.w = 0;

	/**
	 *  List of landmark estimates over time
	 * @type {Object}
	 */
	this.landmarks = {};

	this.trace = [[x,y,theta]];

	this.iteration = 0;
};

Particle.prototype.sample = function(control) {
	
	// P(x_t | x_{t-1} , control )

	xPrevious = this.x;
	yPrevious = this.y;
	rPrevious = this.theta;

	//Sample here
	this.x = xPrevious + control[0] + MathAdapter.randn(0,2);
	this.y = yPrevious + control[1] + MathAdapter.randn(0,2);

	this.theta = control[2] + (MathAdapter.randn(0,1));
	
	this.trace.push([this.x, this.y, this.theta]);

	this.iteration++;

};

Particle.prototype.resample = function(first_argument) {
	// body...
};8


Particle.prototype.landmarkUpdate = function(measurements) {
	
	//Measurements is a list of {id: landmark, value: rssi} values

	for(var i = 0; i < measurements.length; i++)
	{
		var z = measurements[i]

		if(this.landmarks[z.id] == undefined) {
			this.initLandmark(z);
		}
		else {
			this.updateLandmark(z);
		}
	}
};

Particle.prototype.initLandmark = function(z) {
	
	var means = [0,0];
	var covariance = [[0,0], [0,0]];

	// mean = inverse of observation function
	
	var bearing = this.theta + z.theta;

	//Estimate the position of the landmark
	var estX = this.x + z.r * Math.cos(bearing);
	var estY = this.y + z.r * Math.sin(bearing);

	//Global covariance for range and bearing
	var Q = math.matrix([[5, 0], [0, 0.25]])

	//Calculate the Jacobian
	H = Particle.jacobian(estX, estY);

	//H^-1
	Hinv = math.inv(H);

	//Calculate covariance
	//H^-1 . Q . (H^-1)^T
	cov = math.multiply(math.multiply(Hinv, Q), math.transpose(Hinv))

	this.landmarks[z.id] = {x: estX, y: estY, cov: cov};
};

Particle.prototype.updateLandmark = function(z) {
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
		this.theta = original.theta;
		this.w = 0;
		this.iteration = original.iteration;

		this.trace = original.trace.slice();
};

Particle.jacobian = function(x,y) {

	r = Math.sqrt(Math.pow(x,2) + Math.pow(x,2))
	r2 = Math.pow(r,2);

	if(r == 0) {
		console.error("Cannot compute jacobian at (0,0)")
	}

	return math.matrix([[x / r 	, y / r], 
						[-y / r2, x / r2]]);
}