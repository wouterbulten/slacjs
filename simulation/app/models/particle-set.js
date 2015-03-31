/**
 * ParticleSet
 * @param int amount of particles
 */
var ParticleSet = function(M) {

	this.M = M;

	this.particles = [];
}

/**
 * Initalise all particles
 * @return void
 */
ParticleSet.prototype.initializeParticles = function(xStart, yStart, sd) {
	
	for(var m = 0; m < this.M; m++) {

		x = 0 + MathAdapter.randn(0, sd);
		y = 0 + MathAdapter.randn(0, sd);
		orientation = MathAdapter.randn(0,1) * 2 * Math.PI;

		this.particles.push(new Particle(x, y, orientation));
	}
};

/**
 * Return the x,y estimate of each particle in a list
 * @return list of x,y coordinates
 */
ParticleSet.prototype.getEstimateList = function() {
	
	var list = [];

	this.particles.forEach(function(p) {
		list.push([p.x, p.y]);
	});

	return list;
};

/**
 * Update all particles in the set
 * @param  {Array}
 * @param  {Array}
 * @return {void}
 */
ParticleSet.prototype.update = function(control, measurements) {

	//Generate new samples
	this.sample(control);

	//Update the landmark estimates
	this.updateLandmarks(measurements);

	//Resample
	this.resample();
};

ParticleSet.prototype.updateLandmarks = function(measurements) {
	
	this.particles.forEach(function(p) {
		p.landmarkUpdate(measurements);
	});
};

/**
 * Let each particle generate a new sample
 * @param  array control x,y,r control
 * @return void
 */
ParticleSet.prototype.sample = function(control) {
	
	this.particles.forEach(function(p) {
		p.sample(control);
	});
};

/**
 * Resample the particles
 * @return void
 */
ParticleSet.prototype.resample = function() {
		
	var stackedNormalizedWeights = [];
	var sumOfWeights = 0;
	var oldParticles = this.particles;

	//Calculate total sum of weights
	oldParticles.forEach(function(p, i) {
		var weight = p.computeWeight();

		stackedNormalizedWeights[i] = weight + sumOfWeights;
		sumOfWeights += weight;
	});

	//Normalise
	stackedNormalizedWeights.forEach(function(w, i, weights) {
		weights[i] = w / sumOfWeights;
	});

	//Select new samples
	this.particles.forEach(function(p) {

		var sample = ParticleSet.randomSample(oldParticles, stackedNormalizedWeights);
		p.cloneParticle(sample);
	}, this)
};

/**
 * Take weighted sample from a list
 * @param  array particles
 * @param  array weights
 * @return sample from particles
 */
ParticleSet.randomSample = function(particles, weights)
{
	var rand = Math.random();
	var last = 0;

	for(var m = 0; m < particles.length; m++) {

		if(weights[m] > rand) {
			return particles[m];
		}
	}
}