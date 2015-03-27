var Particle = function(x,y,r) {

	this.x = x;
	this.y = y;
	this.r = r;
	this.w = 0.1;

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
	this.r = rPrevious + control[2] + (1 * Math.random());
	
	this.trace.push([this.x, this.y, this.r])
};

Particle.prototype.calculateWeight = function(first_argument) {
	
	console.debug('Not implemented yet');
};