var ParticleSet = function(M) {

	this.M = M;

	this.particles = [];
}

ParticleSet.prototype.initializeParticles = function() {
	
	var orientation = 0.5 * Math.PI;

	for(var m = 0; m < this.M; m++) {

		x = 0 + (4 * Math.random() - 2);
		y = 0 + (4 * Math.random() - 2);

		this.particles.push(new Particle(x, y, orientation));
	}
};

ParticleSet.prototype.getEstimateList = function() {
	
	var list = [];

	this.particles.forEach(function(p) {
		list.push([p.x, p.y]);
	});

	return list;
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
		stackedNormalizedWeights[i] = p.computeWeight();
		sumOfWeights += stackedNormalizedWeights[i];
	});

	//Normalise
	stackedNormalizedWeights.forEach(function(w, i, weights) {
		weights[i] = w / sumOfWeights;
	});

	//Select new samples
	this.particles.forEach(function(p) {

		var sample = randomSample(oldParticles, stackedNormalizedWeights);
		console.log(sample);
		p.cloneParticle(sample);
	})
};

function randomSample(particles, weights)
{
	var rand = Math.random();
	var last = 0;

	for(var m = 0; m < particles.length; m++) {

		if(weights[m] > rand) {
			return particles[m];
		}
	}
}