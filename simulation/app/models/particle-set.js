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

ParticleSet.prototype.sample = function(control) {
	
	this.particles.forEach(function(p) {
		p.sample(control);
	});
};