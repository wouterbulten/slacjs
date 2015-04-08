/**
 * [app description]
 * @type {Object}
 */
"use strict";

var app = {

    config: {},

    plot: undefined,

    iteration: 0,

    groundTruthSeries: 0,
    landmarkSeries: 1,
    particleSeries: 2,
    sensorRangeSeries: 4,

    user: undefined,
    landmarks: [],
    particles: undefined,

    // Application Constructor
    initialize: function initialize(config) {

        this.config = config;

        visualisation.init(config.xMax, config.yMax);

        this.initalizeUser();
        this.initalizeLandmarks();
        this.initializeParticles();
        //this.initializePlot();
        //this.plotLandmarks();

        visualisation.plotLandmarks(this.landmarks);
    },

    initalizeLandmarks: function initalizeLandmarks() {
        this.landmarks = [];

        for (var n = 0; n < this.config.nLandmarks; n++) {
            x = Math.random() * this.config.xMax;
            y = Math.random() * this.config.yMax;

            this.landmarks.push(new Landmark("Node #" + n, n, x, y, this.config.pathLoss, this.config.txPower, this.config.sensorNoise, this.config.sensorRange));
        }
    },

    initalizeUser: function initalizeUser() {
        this.user = new User(25, 25, this.config.xMax, this.config.yMax);
    },

    initializeParticles: function initializeParticles() {
        this.particles = new ParticleSet(this.config.nParticles);
        this.particles.initializeParticles(0, 0, 4);
    },

    iterate: function iterate() {

        this.user.step();

        Z = [];
        //Get sensor readings
        this.landmarks.forEach(function (l) {
            if (l.inRange(this.user.x, this.user.y)) {
                //@todo Remove r, now added to create a range-only with bearing implementation

                var rssi = l.rssiAtLocation(this.user.x, this.user.y);

                //Calculate bearing
                var r = Math.atan2(l.y - this.user.y, l.x - this.user.x) - this.user.r; //atan2(y,x)

                Z.push({
                    id: l.id,
                    value: rssi,
                    r: l.rssiToDistance(rssi),
                    theta: r + MathAdapter.randn(0, 0.5)
                });
            }
        }, this);

        //Update all particles
        this.particles.update(this.user.getControl(), Z);

        this.iteration++;

        //Update the canvas
        visualisation.update(this.user, this.landmarks, this.particles.particles, this.particles.bestSample());
    },

    reset: function reset() {

        this.initialize(this.config);
    }
};
/**
 * Landmark
 * Todo: refactor to use config object
 * @param {[type]}
 * @param {[type]}
 * @param {[type]}
 * @param {[type]}
 * @param {[type]}
 * @param {[type]}
 * @param {[type]}
 * @param {[type]}
 */
"use strict";

var Landmark = function Landmark(name, id, x, y, n, txPower, noise, range) {

	this.name = name;
	this.id = id;
	this.x = x;
	this.y = y;
	this.n = n;
	this.txPower = txPower;
	this.noise = noise;
	this.range = range;
};

Landmark.prototype.distance = function (x, y) {
	return Math.sqrt(Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2));
};

Landmark.prototype.rssiAtLocationRaw = function (x, y) {
	return -(10 * this.n) * MathAdapter.log(Math.max(this.distance(x, y), 0.1), 10) + this.txPower;
};

Landmark.prototype.rssiAtLocation = function (x, y) {
	return this.rssiAtLocationRaw(x, y) + MathAdapter.randn(0, this.noise);
};

Landmark.prototype.inRange = function (x, y) {
	return this.distance(x, y) < this.range;
};

Landmark.prototype.rssiToDistance = function (rssi) {
	return Math.pow(10, (rssi - this.txPower) / (-10 * this.n));
};
/**
 * ParticleSet
 * @param int amount of particles
 */
"use strict";

var ParticleSet = function ParticleSet(M) {

	this.M = M;

	this.particles = [];
};

/**
 * Initalise all particles
 * @return void
 */
ParticleSet.prototype.initializeParticles = function (xStart, yStart, sd) {

	for (var m = 0; m < this.M; m++) {

		//@todo look at this initalisation, does it require randomness?
		x = 0;
		y = 0;
		orientation = MathAdapter.randn(0, 1) * 2 * Math.PI;

		this.particles.push(new Particle(x, y, orientation));
	}
};

/**
 * Return the x,y estimate of each particle in a list
 * @return list of x,y coordinates
 */
ParticleSet.prototype.getEstimateList = function () {

	var list = [];

	this.particles.forEach(function (p) {
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
ParticleSet.prototype.update = function (control, measurements) {

	//Generate new samples
	this.sample(control);

	//Update the landmark estimates
	this.updateLandmarks(measurements);

	//Resample
	this.resample();
};

ParticleSet.prototype.updateLandmarks = function (measurements) {

	this.particles.forEach(function (p) {
		p.landmarkUpdate(measurements);
	});
};

/**
 * Let each particle generate a new sample
 * @param  array control x,y,r control
 * @return void
 */
ParticleSet.prototype.sample = function (control) {

	this.particles.forEach(function (p) {
		p.sample(control);
	});
};

/**
 * Resample the particles
 * @return void
 */
ParticleSet.prototype.resample = function () {

	var stackedNormalizedWeights = [];
	var sumOfWeights = 0;
	var oldParticles = this.particles;

	//Calculate total sum of weights
	oldParticles.forEach(function (p, i) {
		var weight = p.weight();

		stackedNormalizedWeights[i] = weight + sumOfWeights;
		sumOfWeights += weight;
	});

	//Normalise
	stackedNormalizedWeights.forEach(function (w, i, weights) {
		weights[i] = w / sumOfWeights;
	});

	//Select new samples
	this.particles.forEach(function (p) {

		var sample = ParticleSet.randomSample(oldParticles, stackedNormalizedWeights);
		p.cloneParticle(sample);
	}, this);
};

/**
 * Returns the particle with the heighest weight
 * @return {Particle}
 */
ParticleSet.prototype.bestSample = function () {

	var bestSample = this.particles[0];

	this.particles.forEach(function (p) {
		if (p.w > bestSample.w) {
			bestSample = p;
		}
	});

	return bestSample;
};

/**
 * Take weighted sample from a list
 * @param  array particles
 * @param  array weights
 * @return sample from particles
 */
ParticleSet.randomSample = function (particles, weights) {
	var rand = Math.random();
	var last = 0;

	for (var m = 0; m < particles.length; m++) {

		if (weights[m] > rand) {
			return particles[m];
		}
	}

	console.error("No particle selected");
};
"use strict";

var Particle = function Particle(x, y, theta) {

	this.x = x;
	this.y = y;
	this.theta = theta;
	this.w = 0;

	/**
  *  List of landmark estimates over time
  * @type {Object}
  */
	this.landmarks = {};

	this.trace = [[x, y, theta]];

	this.iteration = 0;
};

Particle.prototype.sample = function (control) {

	this.iteration++;

	// P(x_t | x_{t-1} , control )

	xPrevious = this.x;
	yPrevious = this.y;
	rPrevious = this.theta;

	//Sample here
	this.x = xPrevious + control[0] + MathAdapter.randn(0, 1);
	this.y = yPrevious + control[1] + MathAdapter.randn(0, 1);

	this.theta = control[2] + MathAdapter.randn(0, 1);

	this.trace.push([this.x, this.y, this.theta]);
};

Particle.prototype.resample = function (first_argument) {};

Particle.prototype.landmarkUpdate = function (measurements) {

	//Measurements is a list of {id: landmark, ...} objects

	for (var i = 0; i < measurements.length; i++) {
		var z = measurements[i];

		if (this.landmarks[z.id] == undefined) {
			this.initLandmark(z);
		} else {
			this.updateLandmark(z);
		}
	}

	//Update weights
	var sumOfWeights = 0;
	var N = 0;
	for (lId in this.landmarks) {
		if (this.landmarks.hasOwnProperty(lId)) {
			sumOfWeights += this.landmarks[lId].w;
			N++;
		}
	}

	this.w = sumOfWeights / N;
};

Particle.prototype.initLandmark = function (z) {

	var means = [0, 0];
	var covariance = [[0, 0], [0, 0]];

	// mean = inverse of observation function

	//todo: should be max 2pi
	var bearing = this.theta + z.theta;

	//Estimate the position of the landmark
	//var estX = this.x + z.r * Math.cos(bearing);
	var estX = z.r * Math.cos(bearing);
	//var estY = this.y + z.r * Math.sin(bearing);
	var estY = z.r * Math.sin(bearing);

	//Global covariance for range and bearing
	var Q = math.matrix([[5, 0], [0, 0.25]]);

	//Calculate the Jacobian
	H = Particle.jacobian(estX, estY);

	//H^-1
	Hinv = math.inv(H);

	//Calculate covariance
	//H^-1 . Q . (H^-1)^T
	cov = math.multiply(math.multiply(Hinv, Q), math.transpose(Hinv));

	this.landmarks[z.id] = { x: estX, y: estY, cov: cov, w: 1 };
};

Particle.prototype.updateLandmark = function (z) {

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
	var Q = math.matrix([[5, 0], [0, 0.25]]);

	//Calculate covariance
	var cov = math.add(math.multiply(math.multiply(H, oldCov), Htrans), Q);

	//Kalman gain
	//K = oldCov * H^t * Q^-1
	var K = math.multiply(math.multiply(oldCov, Htrans), math.inv(cov));

	//Update mean
	var angle = z.theta - predTheta;
	if (Math.abs(angle) <= Math.PI) {
		angle = angle;
	} else if (angle > 0) {
		angle = angle - 2 * Math.PI;
	} else {
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

	this.landmarks[z.id] = { x: estX, y: estY, cov: newCov, w: w };
};

/**
 * Compute the weight of this particle
 * @return {float}
 */
Particle.prototype.weight = function () {

	return this.w;
};

/**
 * Clone a particle by replacing the internal state with values
 * from a second particle.
 * @param  {Particle} original
 * @return {void}
 */
Particle.prototype.cloneParticle = function (original) {
	this.x = original.x;
	this.y = original.y;
	this.theta = original.theta;
	this.w = 0;
	this.iteration = original.iteration;

	this.trace = original.trace.slice();
};

Particle.jacobian = function (x, y) {

	r = Math.sqrt(Math.pow(x, 2) + Math.pow(x, 2));
	r2 = Math.pow(r, 2);

	if (r == 0) {
		console.error("Cannot compute jacobian at (0,0)");
	}

	return math.matrix([[x / r, y / r], [-y / r2, x / r2]]);
};

// body...
'use strict';

var Sensor = function Sensor() {};

Sensor.prototype.readingToPosition = function (measurement) {
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

RangeBearingSensor.prototype.readingToPosition = function (x, y, measurement) {};
"use strict";

var User = function User(x, y, xMax, yMax) {

	//Current position
	this.x = x;
	this.y = y;
	this.r = Math.random() * 2 * Math.PI;

	//Current velocity
	this.v = 5;

	//Latest control, without noise
	this.dx = 0;
	this.dy = 0;
	this.dr = 0;

	this.xMax = xMax;
	this.yMax = yMax;
	this.trace = [[x, y]];
};

User.prototype.moveToPosition = function (xn, yn) {

	this.trace.push([xn, yn]);
	this.x = xn;
	this.y = yn;
};

User.prototype.step = function () {

	this.dx = Math.cos(this.r) * this.v;
	this.dy = Math.sin(this.r) * this.v;

	xn = Math.max(Math.min(this.x + this.dx + MathAdapter.randn(0, 1), this.xMax), 0);
	yn = Math.max(Math.min(this.y + this.dy + MathAdapter.randn(0, 1), this.yMax), 0);

	if (xn == 0 || xn == this.xMax) {
		this.r = Math.PI - this.r;
	} else if (yn == 0 || yn == this.yMax) {
		this.r = 2 * Math.PI - this.r;
	}

	this.dr = this.r; //+ MathAdapter.randn(0,1);

	this.moveToPosition(xn, yn);
};

User.prototype.getControl = function () {
	return [this.dx, this.dy, this.dr];
};
"use strict";

var MathAdapter = function MathAdapter() {};

MathAdapter.randn = function (mean, sd) {

	//Retrieved from jStat

	var u, v, x, y, q, mat;

	do {
		u = Math.random();
		v = 1.7156 * (Math.random() - 0.5);
		x = u - 0.449871;
		y = Math.abs(v) + 0.386595;
		q = x * x + y * (0.196 * y - 0.25472 * x);
	} while (q > 0.27597 && (q > 0.27846 || v * v > -4 * Math.log(u) * u * u));

	return v / u * sd + mean;
};

/**
 * Compute the log with a given base
 *
 * Used primarily as log10 is not implemented yet on mobile browsers
 * 
 * @param  {int}
 * @param  {int}
 * @return {float}
 */
MathAdapter.log = function (x, base) {
	return Math.log(x) / Math.log(base);
};

/**
 * Calculates two eigenvalues and eigenvectors from a 2x2 covariance matrix
 * @param  {Matrix} cov [description]
 * @return {[type]}     [description]
 */
MathAdapter.eigenValues = function (cov) {

	cov = cov.valueOf();
	var a = cov[0][0];
	var b = cov[0][1];
	var c = cov[1][0];
	var d = cov[1][1];

	var A = 1;
	var B = -(a + d);
	var C = a * d - c * b;

	var L1 = -B + Math.sqrt(Math.pow(a - d, 2) + 4 * c * d) / 2 * A;
	var L2 = -B - Math.sqrt(Math.pow(a - d, 2) + 4 * c * d) / 2 * A;

	var y1 = (L1 - a) / b;
	var y2 = (L2 - a) / b;
	var mag1 = Math.sqrt(1 + y1 * y1);
	var mag2 = Math.sqrt(1 + y2 * y2);

	return {
		values: [L1, L2],
		vectors: [[1 / mag1, y1 / mag1], [1 / mag2, y2 / mag2]]
	};
};
'use strict';

var visualisation = {

	canvas: {
		landmarks: undefined,
		map: undefined },

	ctx: {
		landmarks: undefined,
		map: undefined },

	userPath: undefined,
	landmarks: [],

	scaled: false,

	stageElement: 'slac-stage',
	canvasElements: {
		landmarks: 'slac-map-landmarks',
		map: 'slac-map'
	},

	dpi: 2,

	styleBase: {
		traceWidth: 5,
		particleTraceWidth: 2,
		landmarkSize: 12,
		particleSize: 6 },

	style: {
		traceWidth: 0,
		particleTraceWidth: 0,
		landmarkSize: 0,
		particleSize: 0 },

	xMax: 0,
	yMax: 0,

	init: function init(xMax, yMax) {

		var canvasLandmarks = document.getElementById(this.canvasElements.landmarks);
		var canvasMap = document.getElementById(this.canvasElements.map);

		var padding = 20;

		this.canvas.landmarks = canvasLandmarks;
		this.canvas.map = canvasMap;

		this.xMax = xMax;
		this.yMax = yMax;

		this.ctx.landmarks = canvasLandmarks.getContext('2d');
		this.ctx.map = canvasMap.getContext('2d');

		if (!this.scaled) {
			this.scaleCanvas();
		}

		//Clear any remaining drawings
		this.ctx.landmarks.clearRect(0, 0, canvasLandmarks.width, canvasLandmarks.height);
		this.ctx.map.clearRect(0, 0, canvasMap.width, canvasMap.height);

		self.sx = function (x) {

			return x;
			//return x*((canvas.width() - (2 * padding))/xMax) + padding;
		};
		self.sy = function (y) {
			return y;
			//return (yMax - y) *((canvas.height() - (2 * padding))/yMax) + padding
		};
	},

	scaleCanvas: function scaleCanvas() {

		//Get desired width of the canvas
		var width = this.dpi * Math.min(window.innerWidth, window.innerHeight);
		var scaledWidth = this.dpi * width;

		this.canvas.landmarks.width = scaledWidth;
		this.canvas.landmarks.style.width = width + 'px';
		this.canvas.landmarks.height = scaledWidth;
		this.canvas.landmarks.style.height = width + 'px';

		this.canvas.map.width = scaledWidth;
		this.canvas.map.style.width = width + 'px';
		this.canvas.map.height = scaledWidth;
		this.canvas.map.style.height = width + 'px';

		var scaleFactorX = width / this.xMax;
		var scaleFactorY = width / this.yMax;

		this.ctx.map.scale(scaleFactorX, scaleFactorY);
		this.ctx.landmarks.scale(scaleFactorX, scaleFactorY);

		this.style.traceWidth = this.styleBase.traceWidth / scaleFactorX;
		this.style.particleTraceWidth = this.styleBase.particleTraceWidth / scaleFactorX;
		this.style.landmarkSize = this.styleBase.landmarkSize / scaleFactorX;
		this.style.particleSize = this.styleBase.particleSize / scaleFactorX;
	},

	update: function update(user, landmarks, particles, bestParticle) {

		//Clear any remaining drawings
		this.ctx.map.clearRect(0, 0, this.canvas.map.width, this.canvas.map.height);

		this.plotLandmarks(landmarks);
		this.plotUserTrace(user);
		this.plotParticles(user, particles);

		/*particles.forEach(function(b) {
  	this.plotLandmarkPredictions(user,b, landmarks);
  }, this);*/
		this.plotLandmarkPredictions(user, bestParticle, landmarks);
	},

	plotLandmarks: function plotLandmarks(landmarks) {

		this.ctx.landmarks.fillStyle = '#000000';

		landmarks.forEach(function (l) {

			var x = l.x - 0.5 * this.style.landmarkSize;
			var y = l.y - 0.5 * this.style.landmarkSize;

			this.ctx.landmarks.fillRect(x, y, this.style.landmarkSize, this.style.landmarkSize);
		}, this);
	},

	plotUserTrace: function plotUserTrace(user) {

		this.ctx.map.lineJoin = 'round';
		this.ctx.map.lineWidth = this.style.traceWidth;
		this.ctx.map.strokeStyle = '#1B61D1';
		this.ctx.map.beginPath();

		user.trace.forEach(function (t, i) {
			if (i == 0) {
				this.ctx.map.moveTo(sx(t[0]), sy(t[1]));
			} else {
				this.ctx.map.lineTo(sx(t[0]), sy(t[1]));
			}
		}, this);

		this.ctx.map.stroke();
		this.ctx.map.closePath();
	},

	plotParticles: function plotParticles(user, particles) {

		this.ctx.map.lineJoin = 'round';
		this.ctx.map.lineWidth = this.style.particleTraceWidth;
		this.ctx.map.fillStyle = '#960E0E';
		this.ctx.map.strokeStyle = '#C7C7C7';

		//Particles always start at 0,0 but the user can start somewhere else in the global frame
		var baseX = user.trace[0][0];
		var baseY = user.trace[0][1];

		//Plot the traces & particles
		particles.forEach(function (p) {

			this.ctx.map.beginPath();

			p.trace.forEach(function (t, i) {
				if (i == 0) {
					this.ctx.map.moveTo(sx(baseX + t[0]), sy(baseY + t[1]));
				} else {
					this.ctx.map.lineTo(sx(baseX + t[0]), sy(baseY + t[1]));
				}
			}, this);

			this.ctx.map.stroke();
			this.ctx.map.closePath();

			var pX = p.trace[p.trace.length - 1][0] + baseX - 0.5 * this.style.particleSize;
			var pY = p.trace[p.trace.length - 1][1] + baseY - 0.5 * this.style.particleSize;

			this.ctx.map.fillRect(pX, pY, this.style.particleSize, this.style.particleSize);
		}, this);
	},

	plotLandmarkPredictions: function plotLandmarkPredictions(user, particle, landmarks) {

		this.ctx.map.lineWidth = this.style.particleTraceWidth;
		this.ctx.map.fillStyle = '#10870C';
		this.ctx.map.strokeStyle = '#C7C7C7';

		for (lId in particle.landmarks) {
			if (particle.landmarks.hasOwnProperty(lId)) {
				var l = particle.landmarks[lId];

				var x = l.x + user.trace[0][0];
				var y = l.y + user.trace[0][1];
				var trueX = landmarks[lId].x;
				var trueY = landmarks[lId].y;

				this.ctx.map.fillRect(x, y, this.style.particleSize, this.style.particleSize);

				this.ctx.map.beginPath();
				this.ctx.map.moveTo(x, y);
				this.ctx.map.lineTo(trueX, trueY);
				this.ctx.map.stroke();
				this.ctx.map.closePath();

				/*
    
    Drawing of the correct ellipse does not work yet
    	this.drawEllipseWithBezierByCenter(this.ctx.map, x, y, 10, 10)
    	var eig = MathAdapter.eigenValues(l.cov);
    	if(eig[0] > eig[1]) {
    	var major = [
    		eig.vectors[0][0] * Math.sqrt(eig.values[0]),
    		eig.vectors[0][1] * Math.sqrt(eig.values[0])
    	];
    	var minor = [
    		eig.vectors[1][0] * Math.sqrt(eig.values[1]),
    		eig.vectors[1][1] * Math.sqrt(eig.values[1])
    	];
    }
    else {
    	var major = [
    		eig.vectors[1][0] * Math.sqrt(eig.values[1]),
    		eig.vectors[1][1] * Math.sqrt(eig.values[1])
    	];
    	var minor = [
    		eig.vectors[0][0] * Math.sqrt(eig.values[0]),
    		eig.vectors[0][1] * Math.sqrt(eig.values[0])
    	];
    }
    	var beginX = beginY = 0;
    	for(var i = 0; i < 16; i++) {
    		var r = Math.PI * (i/8);
    	var x = minor[0] * Math.cos(r) + major[0] * Math.sin(r) + user.trace[0][0];
    	var y = minor[1] * Math.cos(r) + major[1] * Math.sin(r) + user.trace[0][1];
    	console.log([x,y])
    	if(i == 0) {
    		this.ctx.map.moveTo(x, y);
    		beginX = x;
    		beginY = y;
    	}
    	else {
    		this.ctx.map.lineTo(x, y);
    	}
    }
    	this.ctx.map.lineTo(beginX, beginY);*/
			}
		}
	},

	/**
  * Draw elipse with a given center
  * @param  {[type]} ctx   [description]
  * @param  {[type]} cx    [description]
  * @param  {[type]} cy    [description]
  * @param  {[type]} w     [description]
  * @param  {[type]} h     [description]
  * @param  {[type]} style [description]
  * @return {[type]}       [description]
  *
  * Source: http://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas
  */
	drawEllipseWithBezierByCenter: function drawEllipseWithBezierByCenter(ctx, cx, cy, w, h) {
		this.drawEllipseWithBezier(ctx, cx - w / 2, cy - h / 2, w, h);
	},

	/**
  * Draw elipse
  * @param  {[type]} ctx [description]
  * @param  {[type]} x   [description]
  * @param  {[type]} y   [description]
  * @param  {[type]} w   [description]
  * @param  {[type]} h   [description]
  * @return {[type]}     [description]
  *
  * Source: http://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas
  */
	drawEllipseWithBezier: function drawEllipseWithBezier(ctx, x, y, w, h) {
		var kappa = 0.5522848,
		    ox = w / 2 * kappa,
		    // control point offset horizontal
		oy = h / 2 * kappa,
		    // control point offset vertical
		xe = x + w,
		    // x-end
		ye = y + h,
		    // y-end
		xm = x + w / 2,
		    // x-middle
		ym = y + h / 2; // y-middle

		ctx.beginPath();
		ctx.moveTo(x, ym);
		ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
		ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
		ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
		ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
		ctx.stroke();
	}
};
"use strict";