var Particle = function(x,y,r) {

	this.x = x;
	this.y = y;
	this.r = r;
	this.w = 0;

	this.trace = [[x,y,r]];

	this.iteration = 0;
};

Particle.prototype.sample = function(control) {
	
	// P(x_t | x_{t-1} , control )

	xPrevious = this.x;
	yPrevious = this.y;
	rPrevious = this.r;

	//Sample here
	this.x = xPrevious + control[0] + (2 * Math.random() - 1);
	this.y = yPrevious + control[1] + (2 * Math.random() - 1);

	this.r = control[2] + (1 * Math.random());
	
	this.trace.push([this.x, this.y, this.r]);

	this.iteration++;

};

/**
 * Compute the weight of this particle
 * @return float
 */
Particle.prototype.computeWeight = function() {
	
	return 0.1;
};

/**
 * Clone a particle by replacing the internal state with values
 * from a second particle.
 * @param  Particle original
 * @return void
 */
Particle.prototype.cloneParticle = function(original) {
		this.x = original.x;
		this.y = original.y;
		this.r = original.r;
		this.w = 0;
		this.iteration = original.iteration;

		this.trace = original.trace.slice();
};