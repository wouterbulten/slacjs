var Particle = function(x,y,orientation) {

	this.x = x;
	this.y = y;
	this.orientation = orientation;

	this.trace = [[x,y,orientation]];

	this.iteration = 0;
};

Particle.prototype.sample = function(control) {
	
	// P(x_t | x_{t-1} , control )

	xPrevious = this.x;
	yPrevious = this.y;
	oPrevious = this.orientation;

	//Sample here

	
};