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
	
	this.iteration++;

	// P(x_t | x_{t-1} , control )

	xPrevious = this.x;
	yPrevious = this.y;
	rPrevious = this.theta;

	//Sample here
	this.x = xPrevious + control[0] + MathAdapter.randn(0,1);
	this.y = yPrevious + control[1] + MathAdapter.randn(0,1);

	this.theta = control[2] + (MathAdapter.randn(0,1));
	
	this.trace.push([this.x, this.y, this.theta]);
};

Particle.prototype.resample = function(first_argument) {
	// body...
};


Particle.prototype.landmarkUpdate = function(measurements) {
	
	//Measurements is a list of {id: landmark, ...} objects

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

	//Update weights
	var sumOfWeights = 0;
	var N = 0;
	for(lId in this.landmarks)
	{
			if(this.landmarks.hasOwnProperty(lId)) {
				sumOfWeights += this.landmarks[lId].w;
				N++;
			}
	}

	this.w = sumOfWeights / N;
};

Particle.prototype.initLandmark = function(z) {
	
	var means = [0,0];
	var covariance = [[0,0], [0,0]];

	// mean = inverse of observation function
	
	//todo: should be max 2pi
	var bearing = this.theta + z.theta;

	//Estimate the position of the landmark
	//var estX = this.x + z.r * Math.cos(bearing);
	var estX = z.r * Math.cos(bearing);
	//var estY = this.y + z.r * Math.sin(bearing);
	var estY = z.r * Math.sin(bearing);

	//Global covariance for range and bearing
	var Q = math.matrix([[5, 0], [0, 0.25]])

	//Calculate the Jacobian
	H = Particle.jacobian(estX, estY);

	//H^-1
	Hinv = math.inv(H);

	//Calculate covariance
	//H^-1 . Q . (H^-1)^T
	cov = math.multiply(math.multiply(Hinv, Q), math.transpose(Hinv))

	this.landmarks[z.id] = {x: estX, y: estY, cov: cov, w: 1};
};

Particle.prototype.updateLandmark = function(z) {
	
	var oldX = this.landmarks[z.id].x;
	var oldY = this.landmarks[z.id].y;
	var oldCov = this.landmarks[z.id].cov;

	//Measurement prediction
	//Given the predicted location and our current location,
	//what range measurement do we expect?
	var baseX = oldX - this.x;
	var baseY = oldY - this.y;
	var predDist = Math.sqrt(Math.pow(baseX, 2) + Math.pow(baseY, 2));
	var predTheta = Math.atan2(baseY, baseX) - this.theta;

	//Calculate Jacobian
	var H = Particle.jacobian(predDist * Math.cos(predTheta), predDist * Math.sin(predTheta));
	var Htrans = math.transpose(H);

	//Global covariance for range and bearing
	var Q = math.matrix([[5, 0], [0, 0.25]])

	//Calculate covariance
	var cov = math.add(math.multiply(math.multiply(H, oldCov), Htrans), Q)

	//Kalman gain
	//K = oldCov * H^t * Q^-1
	var K = math.multiply(math.multiply(oldCov, Htrans), math.inv(cov));

	//Update mean
	var angle = z.theta - predTheta;
	if(Math.abs(angle) <= Math.PI) {
		angle = angle
	}
	else if(angle > 0) {
		angle = angle - 2 * Math.PI;
	}
	else {
		angle = angle + 2 * Math.PI;
	}
	var correction = [z.r - predDist, angle];
	var update = math.multiply(K, correction).toArray();

	var estX = oldX + update[0];
	var estY = oldY + update[1];

	//Update covariance
	var newCov = math.multiply(math.add(math.eye(2), math.multiply(-1, math.multiply(K, H))), oldCov);

	//Calculate importance factor
	var expPart = -0.5 * math.multiply(math.multiply(math.inv(cov), correction), math.transpose(correction));
	var w = Math.pow(math.det(math.multiply(2 * Math.PI, Q)), -0.5) * Math.exp(expPart);

	this.landmarks[z.id] = {x: estX, y: estY, cov: newCov, w: w};
};

/**
 * Compute the weight of this particle
 * @return {float}
 */
Particle.prototype.weight = function() {
	
	return this.w;
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