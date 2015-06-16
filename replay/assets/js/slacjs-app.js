(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
global module
*/

/**
 * General config for SLACjs
 * @type {Object}
 */
'use strict';

module.exports = {

	environment: 'development',

	exportData: true,

	/**
  * Device orientation, set to false to unlock
  * @see https://github.com/gbenvenuti/cordova-plugin-screen-orientation
  */
	deviceOrientation: {
		android: 'portrait',
		ios: 'landscape'
	},

	particles: {
		N: 50,

		user: {
			defaultPose: {
				x: 0,
				y: 0,
				theta: 0
			},
			sdStep: 0.2,
			sdHeading: 0.1
		}
	},

	pedometer: {
		stepSize: 0.4
	},

	landmarkConfig: {
		n: 2,
		txPower: -60,
		noise: 4,
		range: 20
	},

	sensor: {
		motion: {
			frequency: 100
		},
		rssi: {
			kalman: {
				R: 0.008,
				Q: 4
			},
			minMeasurements: 10
		}
	},

	ble: {
		frequency: 100,
		devicePrefix: 'DoBeacon_upstair'
	}
};

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utilKalman = require('../util/kalman');

var _utilKalman2 = _interopRequireDefault(_utilKalman);

/**
 * Accelerometer based pedometer
 *
 * Based on a FirefoxOS ES5 implementation.
 *
 * @see http://sebastien.menigot.free.fr/index.php?view=article&id=93
 */

var Pedometer = (function () {
	function Pedometer(updateRate) {
		_classCallCheck(this, Pedometer);

		var windowSize = Math.round(2 / (updateRate / 1000));

		this.accNorm = new Array(windowSize); // amplitude of the acceleration

		this.varAcc = 0; // variance of the acceleration on the window L
		this.minAcc = 1; // minimum of the acceleration on the window L
		this.maxAcc = -Infinity; // maximum of the acceleration on the window L
		this.threshold = -Infinity; // threshold to detect a step
		this.sensibility = 1 / 30; // sensibility to detect a step

		this.stepCount = 0; // number of steps
		this.stepArr = new Array(windowSize); // steps in 2 seconds

		this.updateRate = updateRate; //Update rate in ms

		this.filter = new _utilKalman2['default']();

		//Callback to run after a new step
		this.callbackOnStep = undefined;
	}

	_createClass(Pedometer, [{
		key: 'processMeasurement',

		/**
   * Process a new accelerometer measurement
   * @param  {Number} x
   * @param  {Number} y
   * @param  {Number} z
   * @return {void}
   */
		value: function processMeasurement(x, y, z) {

			var norm = this._computeNorm(x, y, z);

			this.accNorm.push(norm);
			this.accNorm.shift();

			this._stepDetection();
		}
	}, {
		key: 'onStep',

		/**
   * Register a callback function to run on a new step
   * @param  {Function} callback
   * @return {void}
   */
		value: function onStep(callback) {
			this.callbackOnStep = callback;
		}
	}, {
		key: '_stepDetection',

		/**
   * Detect whether the user has done a step
   * @return {void}
   */
		value: function _stepDetection() {

			this._computeAccelerationVariance();
			this.minAcc = Math.min.apply(null, this.accNorm);
			this.maxAcc = Math.max.apply(null, this.accNorm);

			this.threshold = (this.minAcc + this.maxAcc) / 2;

			var diff = this.maxAcc - this.minAcc;

			if (

			//Sensiblity, the difference must increase the sensibility
			Math.abs(diff) >= this.sensibility && this.accNorm[this.accNorm.length - 1] >= this.threshold && this.accNorm[this.accNorm.length - 2] < this.threshold && this.stepArr[this.stepArr.length - 1] === 0) {
				this.stepCount++;
				this.stepArr.push(1);
				this.stepArr.shift();

				if (this.callbackOnStep !== undefined) {
					this.callbackOnStep();
				}
			} else {
				this.stepArr.push(0);
				this.stepArr.shift();
			}
		}
	}, {
		key: '_computeNorm',

		/**
   * Compute the norm of the acceleration vector
   * @param  {Number} x
   * @param  {Number} y
   * @param  {Number} z
   * @return {Number} norm of the vector
   */
		value: function _computeNorm(x, y, z) {
			var norm = Math.sqrt(x * x + y * y + z * z);
			var filteredNorm = this.filter.filter(norm);

			return filteredNorm / 9.80665;
		}
	}, {
		key: '_computeAccelerationVariance',

		/**
   * Compute the variance of the acceleration norm vector
   * @return {void}
   */
		value: function _computeAccelerationVariance() {
			var mean = 0;
			var mean2 = 0;

			for (var k = 0; k < this.accNorm.length - 1; k++) {
				mean += this.accNorm[k];
				mean2 += this.accNorm[k] * this.accNorm[k];
			}

			this.varAcc = (mean * mean - mean2) / this.accNorm.length;

			if (this.varAcc - 0.5 > 0) {
				this.varAcc -= 0.5;
			}

			if (!isNaN(this.varAcc)) {
				this.filter.setMeasurementNoise(this.varAcc);
				this.sensibility = 2 * (Math.sqrt(this.varAcc) / (9.80665 * 9.80665));
			} else {
				this.sensibility = 1 / 30;
			}
		}
	}]);

	return Pedometer;
})();

exports['default'] = Pedometer;
module.exports = exports['default'];

//Acceleration must be above the threshold, and the previous one below (i.e. a new step)

},{"../util/kalman":12}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _landmarkParticleSet = require('./landmark-particle-set');

var _landmarkParticleSet2 = _interopRequireDefault(_landmarkParticleSet);

var LandmarkInitializationSet = (function () {
	/**
  * Set containing multiple particle sets for initalisation of landmarks
  * @param  {Number} nParticles                 Number of particles in each set
  * @param  {Number} stdRange                   sd of range measurements
  * @param  {Number} randomParticles            Number of random particles
  * @param  {Number} effectiveParticleThreshold Threshold of effective particles
  * @return {LandmarkInitializationSet}
  */

	function LandmarkInitializationSet() {
		var nParticles = arguments[0] === undefined ? 100 : arguments[0];
		var stdRange = arguments[1] === undefined ? 0.5 : arguments[1];
		var randomParticles = arguments[2] === undefined ? 0 : arguments[2];
		var effectiveParticleThreshold = arguments[3] === undefined ? undefined : arguments[3];

		_classCallCheck(this, LandmarkInitializationSet);

		this.nParticles = nParticles;
		this.stdRange = stdRange;
		this.randomParticles = randomParticles;

		if (effectiveParticleThreshold === undefined) {
			this.effectiveParticleThreshold = nParticles / 1.5;
		} else {
			this.effectiveParticleThreshold = effectiveParticleThreshold;
		}

		this.particleSetMap = new Map();
	}

	_createClass(LandmarkInitializationSet, [{
		key: 'addMeasurement',

		/**
   * Integrate a new measurement
   * @param {String} uid UID of landmark
   * @param {Number} x   Position of user
   * @param {Number} y   Position of user
   * @param {Number} r   Range measurement
   */
		value: function addMeasurement(uid, x, y, r) {
			if (!this.has(uid)) {
				this.particleSetMap.set(uid, new _landmarkParticleSet2['default'](this.nParticles, this.stdRange, this.randomParticles, this.effectiveParticleThreshold));
			}

			this.particleSetMap.get(uid).addMeasurement(x, y, r);

			return this;
		}
	}, {
		key: 'has',

		/**
   * Returns true when there is a particle set for a landmark
   * @param  {String}  uid
   * @return {Boolean}
   */
		value: function has(uid) {
			return this.particleSetMap.has(uid);
		}
	}, {
		key: 'estimate',

		/**
   * Returns best position estimate for a landmark
   * @param  {String} uid
   * @return {Object}
   */
		value: function estimate(uid) {
			return this.particleSetMap.get(uid).positionEstimate();
		}
	}, {
		key: 'remove',

		/**
   * Remove a particle set
   * @param  {String} uid
   * @return {void}
   */
		value: function remove(uid) {
			this.particleSetMap['delete'](uid);
		}
	}, {
		key: 'particleSets',

		/**
   * Return all particle sets
   * @return {Array}
   */
		value: function particleSets() {
			return this.particleSetMap.values();
		}
	}]);

	return LandmarkInitializationSet;
})();

exports['default'] = LandmarkInitializationSet;
module.exports = exports['default'];

},{"./landmark-particle-set":4}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utilMath = require('../util/math');

var _utilSampling = require('../util/sampling');

var _utilMotion = require('../util/motion');

var LandmarkParticleSet = (function () {
	/**
  * Create a new particle set for finding the initial position of a landmark
  * @param  {Number} nParticles                 Number of particles
  * @param  {Number} stdRange                   SD of range measurements
  * @param  {Number} randomParticles            Number of random particles to use each update
  * @param  {Number} effectiveParticleThreshold Threshold for resampling
  * @return {LandmarkParticleSet}
  */

	function LandmarkParticleSet(nParticles, stdRange, randomParticles, effectiveParticleThreshold) {
		_classCallCheck(this, LandmarkParticleSet);

		this.nParticles = nParticles;
		this.stdRange = stdRange;
		this.effectiveParticleThreshold = effectiveParticleThreshold;
		this.randomParticles = randomParticles;

		this.measurements = 0;
		this.particles = [];
	}

	_createClass(LandmarkParticleSet, [{
		key: 'addMeasurement',

		/**
   * Integrate a new measurement in the particle set
   * @param {Number} x
   * @param {Number} y
   * @param {Number} r
   */
		value: function addMeasurement(x, y, r) {

			if (this.measurements === 0) {

				//Init the particle set by adding random particles around the user
				this.particles = this._randomParticles(this.nParticles, x, y, r);
			} else {
				this._updateWeights(x, y, r);

				//Determine whether resampling is effective now
				//Is based on the normalised weights
				var weights = this.particles.map(function (p) {
					return p.weight;
				});
				if ((0, _utilSampling.numberOfEffectiveParticles)(weights) < this.effectiveParticleThreshold) {

					//Use low variance resampling to generate a set of new particles
					//Returns a list of N-randomParticles particles
					var set = this._resample(this.nParticles - this.randomParticles);

					//Add new uniformly distributed particles tot the set
					//Random particles are distributed around the current position
					this.particles = set.concat(this._randomParticles(this.randomParticles, x, y, r));
				}
			}

			this.measurements++;
			return this;
		}
	}, {
		key: 'positionEstimate',

		/**
   * Return the current estimate of this landmark's position
   * @return {Object}
   */
		value: function positionEstimate() {

			//Fast check, never return before we have at least multiple measurements
			if (this.measurements < 10) {
				return { estimate: 0, x: 0, y: 0, varX: 1, varY: 1 };
			}

			var _particleVariance = this._particleVariance();

			var varX = _particleVariance.varX;
			var varY = _particleVariance.varY;

			//@todo Make this constraint configurable
			if (varX < 8 && varY < 8) {

				//Compute a weighted average of the particles

				var _averagePosition = this.averagePosition();

				var x = _averagePosition.x;
				var y = _averagePosition.y;

				return {
					estimate: 1,
					x: x, y: y,
					varX: varX, varY: varY
				};
			}

			return { estimate: 0, x: 0, y: 0, varX: 1, varY: 1 };
		}
	}, {
		key: 'bestParticle',

		/**
   * Return the particle with the heighest weight
   * @return {Particle}
   */
		value: function bestParticle() {
			var best = this.particles[0];

			this.particles.forEach(function (p) {
				if (p.weight > best.weight) {
					best = p;
				}
			});

			return best;
		}
	}, {
		key: 'averagePosition',

		/**
   * Return a weighted average of this particle set
   * @return {Object} x,y
   */
		value: function averagePosition() {

			var weights = (0, _utilSampling.normalizeWeights)(this.particles.map(function (p) {
				return p.weight;
			}));

			return {
				x: this.particles.reduce(function (prev, p, i) {
					return prev + weights[i] * p.x;
				}, 0),
				y: this.particles.reduce(function (prev, p, i) {
					return prev + weights[i] * p.y;
				}, 0)
			};
		}
	}, {
		key: '_particleVariance',

		/**
   * Return the particle variance in X and Y
   * @return {Object} varx, vary
   */
		value: function _particleVariance() {

			return {
				varX: (0, _utilMath.variance)(this.particles, function (p) {
					return p.x;
				}),
				varY: (0, _utilMath.variance)(this.particles, function (p) {
					return p.y;
				})
			};
		}
	}, {
		key: '_resample',

		/**
   * Resample the particle set and return a given number of new particles
   * @param  {Number} nSamples Number of particles to return
   * @return {Array}
   */
		value: function _resample(nSamples) {
			var _this = this;

			var weights = this.particles.map(function (p) {
				return p.weight;
			});

			return (0, _utilSampling.lowVarianceSampling)(nSamples, weights).map(function (i) {
				return {
					x: _this.particles[i].x,
					y: _this.particles[i].y,
					weight: 1
				};
			});
		}
	}, {
		key: '_randomParticles',

		/**
   * Init the particle set
   *
   * Creates a set of particles distributed around x,y at a distance
   * following a normal distribution with r as mean.
   *
   * @param  {Number} x Center x
   * @param  {Number} y Center y
   * @param  {Number} r range
   * @return {void}
   */
		value: function _randomParticles(n, x, y, r) {

			var deltaTheta = 2 * Math.PI / n;
			var particles = [];

			for (var i = 0; i < n; i++) {
				var theta = i * deltaTheta;
				var range = r + (0, _utilMath.randn)(0, this.stdRange);

				var _polarToCartesian = (0, _utilMotion.polarToCartesian)(range, theta);

				var dx = _polarToCartesian.dx;
				var dy = _polarToCartesian.dy;

				particles.push({ x: x + dx, y: y + dy, weight: 1 });
			}

			return particles;
		}
	}, {
		key: '_updateWeights',

		/**
   * Update each particle by updating their weights
   * @param  {Number} x
   * @param  {Number} y
   * @param  {Number} r
   * @return {void}
   */
		value: function _updateWeights(x, y, r) {
			var _this2 = this;

			this.particles.forEach(function (p) {

				//Calculate distance estimate
				var dist = Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2));

				//What is the probability of r given dist? p(r|dist)
				//Update the weight accordingly
				//p(r) = N(r|dist,sd)

				var weight = (0, _utilMath.pdfn)(r, dist, _this2.stdRange);

				p.weight = p.weight * weight;
			});
		}
	}]);

	return LandmarkParticleSet;
})();

exports['default'] = LandmarkParticleSet;
module.exports = exports['default'];

},{"../util/math":14,"../util/motion":15,"../util/sampling":16}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _particle = require('./particle');

var _particle2 = _interopRequireDefault(_particle);

var _landmarkInitSet = require('./landmark-init-set');

var _landmarkInitSet2 = _interopRequireDefault(_landmarkInitSet);

var _utilSampling = require('../util/sampling');

var ParticleSet = (function () {
	/**
  * Create a new particle set with a given number of particles
  * @param  {int} nParticles    	 Number of particles
  * @param  {float} options.x     Initial x postion of user
  * @param  {float} options.y     Initial y position of user
  * @param  {float} options.theta Initial theta of user
  * @return ParticleSet
  */

	function ParticleSet(nParticles, userConfig) {
		_classCallCheck(this, ParticleSet);

		this.nParticles = nParticles;

		this.particleList = [];

		//Internal list to keep track of initialised landmarks
		this.initialisedLandmarks = [];
		this.landmarkInitSet = new _landmarkInitSet2['default']();

		for (var i = 0; i < nParticles; i++) {
			this.particleList.push(new _particle2['default'](userConfig));
		}
	}

	_createClass(ParticleSet, [{
		key: 'samplePose',

		/**
   * Given a control, let each particle sample a new user position
   * @param  {[type]} control [description]
   * @return {ParticleSet}
   */
		value: function samplePose(control) {
			this.particleList.forEach(function (p) {
				return p.samplePose(control);
			});

			return this;
		}
	}, {
		key: 'processObservation',

		/**
   * Let each particle process an observation
   * @param  {object} obs
   * @return {ParticleSet}
   */
		value: function processObservation(obs) {
			var _this = this;

			if (obs !== {}) {
				var uid = obs.uid;
				var r = obs.r;
				var _name = obs.name;

				if (this.initialisedLandmarks.indexOf(uid) == -1) {
					(function () {
						var _userEstimate = _this.userEstimate();

						var uX = _userEstimate.x;
						var uY = _userEstimate.y;

						_this.landmarkInitSet.addMeasurement(uid, uX, uY, r);

						var _landmarkInitSet$estimate = _this.landmarkInitSet.estimate(uid);

						var estimate = _landmarkInitSet$estimate.estimate;
						var x = _landmarkInitSet$estimate.x;
						var y = _landmarkInitSet$estimate.y;
						var varX = _landmarkInitSet$estimate.varX;
						var varY = _landmarkInitSet$estimate.varY;

						if (estimate > 0.6) {

							_this.particleList.forEach(function (p) {
								p.addLandmark(obs, { x: x, y: y }, { varX: varX, varY: varY });
							});

							_this.landmarkInitSet.remove(uid);
							_this.initialisedLandmarks.push(uid);
						}
					})();
				} else {
					this.particleList.forEach(function (p) {
						return p.processObservation(obs);
					});
				}
			}

			return this;
		}
	}, {
		key: 'resample',

		/**
   * Resample the internal particle list using their weights
   *
   * Uses a low variance sample
   * @return {ParticleSet}
   */
		value: function resample() {
			var _this2 = this;

			var weights = this.particleList.map(function (p) {
				return p.weight;
			});
			if ((0, _utilSampling.numberOfEffectiveParticles)(weights) < this.nParticles * 0.5) {

				this.particleList = (0, _utilSampling.lowVarianceSampling)(this.nParticles, weights).map(function (i) {
					return new _particle2['default']({}, _this2.particleList[i]);
				});
			}

			return this;
		}
	}, {
		key: 'particles',

		/**
   * Get particles
   * @return {[Array]
   */
		value: function particles() {
			return this.particleList;
		}
	}, {
		key: 'bestParticle',

		/**
   * Return the particle with the heighest weight
   * @return {Particle}
   */
		value: function bestParticle() {
			var best = this.particleList[0];

			this.particleList.forEach(function (p) {
				if (p.weight > best.weight) {
					best = p;
				}
			});

			return best;
		}
	}, {
		key: 'landmarkEstimate',

		/**
   * Compute an average of all landmark estimates
   * @return {Map}
   */
		value: function landmarkEstimate() {
			var weights = (0, _utilSampling.normalizeWeights)(this.particleList.map(function (p) {
				return p.weight;
			}));

			var landmarks = new Map();

			//Loop through all particles to get an estimate of the landmarks
			this.particleList.forEach(function (p, i) {
				p.landmarks.forEach(function (landmark, uid) {
					if (!landmarks.has(uid)) {
						landmarks.set(uid, {
							x: weights[i] * landmark.x,
							y: weights[i] * landmark.y,
							uid: uid,
							name: landmark.name
						});
					} else {
						var l = landmarks.get(uid);

						l.x += weights[i] * landmark.x;
						l.y += weights[i] * landmark.y;
					}
				});
			});

			return landmarks;
		}
	}, {
		key: 'userEstimate',

		/**
   * Get the best estimate of the current user position
   * @return {object}
   */
		value: function userEstimate() {
			var weights = (0, _utilSampling.normalizeWeights)(this.particleList.map(function (p) {
				return p.weight;
			}));

			return {
				x: this.particleList.reduce(function (prev, p, i) {
					return prev + weights[i] * p.user.x;
				}, 0),
				y: this.particleList.reduce(function (prev, p, i) {
					return prev + weights[i] * p.user.y;
				}, 0)
			};
		}
	}]);

	return ParticleSet;
})();

exports['default'] = ParticleSet;
module.exports = exports['default'];

},{"../util/sampling":16,"./landmark-init-set":3,"./particle":6}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _user = require('./user');

var _user2 = _interopRequireDefault(_user);

var _utilMath = require('../util/math');

var Particle = (function () {
	/**
  * Create a new particle
  * @param  {object} userConfig
  * @return {Particle}
  */

	function Particle(userConfig) {
		var parent = arguments[1] === undefined ? undefined : arguments[1];

		_classCallCheck(this, Particle);

		if (parent !== undefined) {
			this.user = _user2['default'].copyUser(parent.user);
			this.landmarks = this._copyMap(parent.landmarks);
		} else {
			this.user = new _user2['default'](userConfig.defaultPose, userConfig);
			this.landmarks = new Map();
		}

		this.weight = 1;
	}

	_createClass(Particle, [{
		key: 'samplePose',

		/**
   * Given a control, sample a new user position
   * @param  {[type]} control [description]
   * @return {Particle}
   */
		value: function samplePose(control) {

			//Sample a pose from the 'control'
			this.user.samplePose(control);

			return this;
		}
	}, {
		key: 'resetWeight',

		/**
   * Reset the weight of the particle
   * @return {Particle}
   */
		value: function resetWeight() {
			this.weight = 1;

			return this;
		}
	}, {
		key: 'addLandmark',

		/**
   * Register a new landmark
   * @param {string} options.uid
   * @param {float} options.r
   * @param {String} options.name
   * @param {Number} options.x 	Initial x position
   * @param {Number} options.y    Initial y
   * @param {Number} options.varX Cov in X direction
   * @param {Number} options.varY Cov in Y direction
   */
		value: function addLandmark(_ref, _ref2) {
			var uid = _ref.uid;
			var r = _ref.r;
			var name = _ref.name;
			var x = _ref2.x;
			var y = _ref2.y;

			var _ref3 = arguments[2] === undefined ? { varX: 1, varY: 1 } : arguments[2];

			var varX = _ref3.varX;
			var varY = _ref3.varY;

			var landmark = {
				x: x,
				y: y,
				name: name,
				cov: [[varX, 0], [0, varY]]
			};

			this.landmarks.set(uid, landmark);
		}
	}, {
		key: 'processObservation',

		/**
   * Update a landmark using the EKF update rule
   * @param  {string} options.uid landmark id
   * @param  {float} options.r    range measurement
   * @return {void}
   */
		value: function processObservation(_ref4) {
			var uid = _ref4.uid;
			var r = _ref4.r;

			//Find the correct EKF
			var l = this.landmarks.get(uid);

			//Compute the difference between the predicted user position of this
			//particle and the predicted position of the landmark.
			var dx = this.user.x - l.x;
			var dy = this.user.y - l.y;

			//@todo find better values for default coviarance
			var errorCov = (0, _utilMath.randn)(2, 0.1);

			var dist = Math.max(0.001, Math.sqrt(dx * dx + dy * dy));

			//Compute innovation: difference between the observation and the predicted value
			var v = r - dist;

			//Compute Jacobian
			var H = [-dx / dist, -dy / dist];

			//Compute covariance of the innovation
			//covV = H * Cov_s * H^T + error
			var HxCov = [l.cov[0][0] * H[0] + l.cov[0][1] * H[1], l.cov[1][0] * H[0] + l.cov[1][1] * H[1]];

			var covV = HxCov[0] * H[0] + HxCov[1] * H[1] + errorCov;

			//Kalman gain
			var K = [HxCov[0] * (1 / covV), HxCov[1] * (1 / covV)];

			//Calculate the new position of the landmark
			var newX = l.x + K[0] * v;
			var newY = l.y + K[1] * v;

			//Calculate the new covariance
			//cov_t = cov_t-1 - K * covV * K^T
			var updateCov = [[K[0] * K[0] * covV, K[0] * K[1] * covV], [K[1] * K[0] * covV, K[1] * K[1] * covV]];

			var newCov = [[l.cov[0][0] - updateCov[0][0], l.cov[0][1] - updateCov[0][1]], [l.cov[1][0] - updateCov[1][0], l.cov[1][1] - updateCov[1][1]]];

			//Update the weight of the particle
			//this.weight = this.weight - (v * (1.0 / covV) * v);
			this.weight = this.weight * (0, _utilMath.pdfn)(r, dist, covV);

			//Update particle
			l.x = newX;
			l.y = newY;
			l.cov = newCov;
		}
	}, {
		key: '_copyMap',

		/**
   * Deep copy a mpa
   * @param  {Map} map
   * @return {Map}
   */
		value: function _copyMap(map) {
			var copy = new Map();

			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = map.entries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var _step$value = _slicedToArray(_step.value, 2);

					var key = _step$value[0];
					var value = _step$value[1];

					copy.set(key, this._copyLandmark(value));
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator['return']) {
						_iterator['return']();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}

			return copy;
		}
	}, {
		key: '_copyLandmark',

		/**
   * Deep copy a landmark
   * @param  {object} landmark
   * @return {landmark}
   */
		value: function _copyLandmark(landmark) {
			var copy = {};

			copy.x = landmark.x;
			copy.y = landmark.y;
			copy.name = landmark.name;
			copy.cov = [].concat(_toConsumableArray(landmark.cov));

			return copy;
		}
	}]);

	return Particle;
})();

exports['default'] = Particle;
module.exports = exports['default'];

},{"../util/math":14,"./user":8}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utilKalman = require('../util/kalman');

var _utilKalman2 = _interopRequireDefault(_utilKalman);

var Sensor = (function () {

	/**
  * Sensor
  * @param  {int} options.n
  * @param  {int} options.txPower
  * @param  {int} options.noise
  * @param  {int} options.range
  * @param  {Number} options.R       Process noise
  * @param  {Number} options.Q       Measurement noise
  * @param  {Number} minMeasurements Minimum amount of measurements before we return a rssi value
  * @return {Sensor}
  */

	function Sensor(_ref) {
		var n = _ref.n;
		var txPower = _ref.txPower;
		var noise = _ref.noise;
		var range = _ref.range;

		var _ref2 = arguments[1] === undefined ? {} : arguments[1];

		var _ref2$R = _ref2.R;
		var R = _ref2$R === undefined ? 0.008 : _ref2$R;
		var _ref2$Q = _ref2.Q;
		var Q = _ref2$Q === undefined ? undefined : _ref2$Q;
		var minMeasurements = arguments[2] === undefined ? 10 : arguments[2];

		_classCallCheck(this, Sensor);

		this.landmarks = new Map();
		this.landmarkConfig = { n: n, txPower: txPower, noise: noise, range: range };

		if (Q === undefined) {
			Q = noise;
		}

		this.R = R;
		this.Q = Q;

		this.minMeasurements = minMeasurements;
	}

	_createClass(Sensor, [{
		key: 'addObservation',

		/**
   * Process a new observation
   * @param {String} uid
   * @param {Number} rssi
   * @param {String} name
   */
		value: function addObservation(uid, rssi, name) {

			//Check whether the rssi value is valid
			if (rssi > 0) {
				return;
			}

			if (this.landmarks.has(uid)) {
				this._updateLandmark(uid, rssi);
			} else {
				this._registerLandmark(uid, rssi, name);
			}
		}
	}, {
		key: 'getObservations',

		/**
   * Get all observations since the last request
   *
   * @return {Array}
   */
		value: function getObservations() {
			var _this = this;

			var observedLandmarks = [];

			//Get all the landmarks that have been upated during the current iteration
			this.landmarks.forEach(function (l, uid) {
				if (l.changed && l.measurements > _this.minMeasurements) {
					var rssi = l.filter.lastMeasurement();

					observedLandmarks.push({ uid: uid, r: _this._rssiToDistance(rssi), name: l.name });
				}

				l.changed = false;
			});

			return observedLandmarks;
		}
	}, {
		key: '_updateLandmark',

		/**
   * Update a landmark given a new rssi observation
   * @param  {float} uid
   * @param  {float} rssi
   * @return {void}
   */
		value: function _updateLandmark(uid, rssi) {

			var landmark = this.landmarks.get(uid);

			landmark.filter.filter(rssi);
			landmark.measurements++;
			landmark.changed = true;
		}
	}, {
		key: '_registerLandmark',

		/**
   * Add a new landmark to the interal list
   * @param  {string} uid  Landanme uid
   * @param  {float} rssi  Current RSSI value
   * @return {void}
   */
		value: function _registerLandmark(uid, rssi, name) {

			console.log('[SLACjs/sensor] New landmark found with uid ' + uid + ' and name ' + name);

			var filter = new _utilKalman2['default']({ R: this.R, Q: this.Q });
			filter.filter(rssi);

			this.landmarks.set(uid, {
				uid: uid,
				changed: true,
				name: name,
				filter: filter,
				measurements: 1
			});
		}
	}, {
		key: '_rssiToDistance',

		/**
   * Convert RSSI to a distance estimate
   * @param  {float} rssi
   * @return {float}
   */
		value: function _rssiToDistance(rssi) {
			return Math.pow(10, (rssi - this.landmarkConfig.txPower) / (-10 * this.landmarkConfig.n));
		}
	}]);

	return Sensor;
})();

exports['default'] = Sensor;
module.exports = exports['default'];

},{"../util/kalman":12}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utilMotion = require('../util/motion');

var _utilMath = require('../util/math');

var _utilLinkedList = require('../util/linked-list');

var _utilLinkedList2 = _interopRequireDefault(_utilLinkedList);

var User = (function () {
	/**
  * Create a new user
  * @param  {float} options.x     Starting x location of the user
  * @param  {float} options.y     Starting y location of the user
  * @param  {float} options.theta Direction of the user in radials relative to the x-axis
  * @param  {object} userConfig
  * @param  {LinkedList} trace 	 Optional trace to extend
  * @return {User}
  */

	function User(_ref, userConfig) {
		var x = _ref.x;
		var y = _ref.y;
		var theta = _ref.theta;
		var trace = arguments[2] === undefined ? undefined : arguments[2];

		_classCallCheck(this, User);

		this.x = x;
		this.y = y;
		this.theta = theta;
		this.userConfig = userConfig;

		this.previousOdometry = { x: x, y: y, theta: theta };

		if (trace === undefined) {
			this.trace = new _utilLinkedList2['default']().add({ x: x, y: y, theta: theta });
		} else {
			//We use a LinkedList here to make use of the reference to the
			//trace instead of copying the whole list
			this.trace = new _utilLinkedList2['default'](trace);
		}
	}

	_createClass(User, [{
		key: 'move',

		/**
   * Move a user to a new position
   * @param  {float} r
   * @param  {float} theta
   * @return {User}
   */
		value: function move(_ref2) {
			var r = _ref2.r;
			var theta = _ref2.theta;

			var _polarToCartesian = (0, _utilMotion.polarToCartesian)(r, theta);

			var dx = _polarToCartesian.dx;
			var dy = _polarToCartesian.dy;

			this.x += dx;
			this.y += dy;
			this.theta = theta;

			this.trace.add({ x: this.x, y: this.y, theta: this.theta });

			return this;
		}
	}, {
		key: 'samplePose',

		/**
   * Move the user to a specific position using a sampling function
   * @param  {Number} x
   * @param  {Number} y
   * @param  {Number} theta
   * @return {User}
   */
		value: function samplePose(_ref3) {
			var r = _ref3.r;
			var theta = _ref3.theta;

			var sdHeading = this.userConfig.sdHeading;

			var sampledHeading = (0, _utilMotion.limitTheta)((0, _utilMath.randn)(theta, sdHeading));

			//Comput the deviation of the noise of the step size
			//@todo Base the deviation of the steps on the pedometer
			var sdStep = this.userConfig.sdStep;

			var sampledR = (0, _utilMath.randn)(r, sdStep);

			//Use odometry to find a new position

			var _polarToCartesian2 = (0, _utilMotion.polarToCartesian)(sampledR, sampledHeading);

			var dx = _polarToCartesian2.dx;
			var dy = _polarToCartesian2.dy;

			this.x += dx;
			this.y += dy;
			this.theta = sampledHeading;

			this.trace.add({ x: this.x, y: this.y, theta: this.theta });

			return this;
		}
	}], [{
		key: 'copyUser',

		/**
   * Safely copy a user object
   * @param  {User} user User to copy
   * @return {User}
   */
		value: function copyUser(user) {
			return new User({
				x: user.x,
				y: user.y,
				theta: user.theta
			}, user.userConfig, user.trace);
		}
	}]);

	return User;
})();

exports['default'] = User;
module.exports = exports['default'];

},{"../util/linked-list":13,"../util/math":14,"../util/motion":15}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var VoteAccumulator = (function () {

	/**
  * Create new voting system
  * @param  {Number} dimension Size of the voting matrix coordinate system
  * @param  {Number} precision Defines amount of cells by dimension/precision
  * @param  {Number} startX    Center of the voting matrix
  * @param  {Number} startY    Center of the voting matrix
  * @return {VoteAccumulator}
  */

	function VoteAccumulator(dimension, precision) {
		var _this = this;

		var startX = arguments[2] === undefined ? 0 : arguments[2];
		var startY = arguments[3] === undefined ? 0 : arguments[3];

		_classCallCheck(this, VoteAccumulator);

		this.dimension = dimension;
		this.precision = precision;
		this.centerX = startX;
		this.centerY = startY;

		this.measurements = 0;
		this.size = Math.round(dimension / precision);

		this.votes = new Array(this.size).fill(0).map(function () {
			return new Array(_this.size).fill(0);
		});
	}

	_createClass(VoteAccumulator, [{
		key: 'addMeasurement',
		value: function addMeasurement(x, y, r) {

			this.measurements++;

			x = x - this.centerX;
			y = y - this.centerY;

			if (!this._inRange(x, y)) {
				console.error('Coordinates not in range of VoteAccumulator internal cell matrix ' + ('with x:' + x + ', y:' + y + ' and centerX:' + this.centerX + ', centerY:' + this.centerY + '.'));
			}

			if (!this._inRange(x + r, y) || !this._inRange(x, y + r)) {
				console.error('Range measurement not in range of VoteAccumulator internal cell matrix.');
			}

			//Get the current center

			var _cartesianToCell = this._cartesianToCell(x, y);

			var row = _cartesianToCell.row;
			var column = _cartesianToCell.column;

			//Convert the range to cell distance
			var dist = Math.round(r / this.precision);

			//Add votes according to midpoint circle algorithm
			this._midpointCircle(row, column, dist);

			return this;
		}
	}, {
		key: 'positionEstimate',
		value: function positionEstimate() {
			if (this.measurements < 3) {
				return { estimate: 0, x: 0, y: 0 };
			}

			var firstValue = 0;
			var firstCell = {};
			var secondValue = 0;
			var secondCell = {};

			for (var row = 0; row < this.size; row++) {
				for (var column = 0; column < this.size; column++) {
					if (this.votes[row][column] > firstValue) {
						firstValue = this.votes[row][column];
						firstCell = { row: row, column: column };
					} else if (this.votes[row][column] > secondValue) {
						secondValue = this.votes[row][column];
						secondCell = { row: row, column: column };
					}
				}
			}

			var _cellToCartesian = this._cellToCartesian(firstCell.row, firstCell.column);

			var x = _cellToCartesian.x;
			var y = _cellToCartesian.y;

			return {
				estimate: firstValue / (firstValue + secondValue),
				x: x, y: y
			};
		}
	}, {
		key: 'toString',

		/**
   * Return a string representation of the vote matrix
   * @return {String}
   */
		value: function toString() {
			return this.votes.reduce(function (output, row) {
				return output + row.reduce(function (rowOutput, cell) {
					if (cell > 9) {
						return rowOutput + cell + ' ';
					} else {
						return rowOutput + cell + '  ';
					}
				}) + '\n';
			}, '\n');
		}
	}, {
		key: '_inRange',

		/**
   * Return true when an cartesian coordinate is in range
   * @param  {Number} x
   * @param  {Number} y
   * @return {Boolean}
   */
		value: function _inRange(x, y) {
			return x >= -0.5 * this.dimension && x <= 0.5 * this.dimension && y >= -0.5 * this.dimension && y <= 0.5 * this.dimension;
		}
	}, {
		key: '_midpointCircle',

		/**
   * Place votes based on the midpoint circle algorithm
   * @param  {Number} row    Center
   * @param  {Number} column Center
   * @param  {Number} r      Radius
   * @return {void}
   */
		value: function _midpointCircle(row, column, r) {

			var x = r;
			var y = 0;
			var radiusError = 1 - x;

			while (x >= y) {
				this._vote(y + row, x + column);
				this._vote(y + row, -x + column);
				this._vote(-y + row, -x + column);
				this._vote(-y + row, x + column);

				if (x != y) {
					this._vote(x + row, y + column);
					this._vote(x + row, -y + column);
					this._vote(-x + row, -y + column);
					this._vote(-x + row, y + column);
				}

				y++;

				if (radiusError < 0) {
					radiusError += 2 * y + 1;
				} else {
					x--;
					radiusError += 2 * (y - x) + 1;
				}
			}

			//At the ends of the cross, we have double votes, substract these
			this._vote(row + r, column, -1);
			this._vote(row - r, column, -1);
			this._vote(row, column + r, -1);
			this._vote(row, column - r, -1);
		}
	}, {
		key: '_vote',

		/**
   * Increase votes at a specific cell
   * @param  {Number} row
   * @param  {Number} column
   * @return {void}
   */
		value: function _vote(row, column) {
			var value = arguments[2] === undefined ? 1 : arguments[2];

			if (row >= this.size || column >= this.size || row < 0 || column < 0) {
				return;
			}

			this.votes[row][column] += value;

			/*if (row > 0) {
   	this.votes[row - 1][column] += value;
   		if (column > 0) {
   		this.votes[row - 1][column - 1] += value;
   	}
   	if (column < (this.size - 1)) {
   		this.votes[row - 1][column + 1] += value;
   	}
   }
   	if (row < (this.size - 1)) {
   	this.votes[row + 1][column] += value;
   		if (column > 0) {
   		this.votes[row + 1][column - 1] += value;
   	}
   	if (column < (this.size - 1)) {
   		this.votes[row + 1][column + 1] += value;
   	}
   }
   	if (column > 0) {
   	this.votes[row][column - 1] += value;
   }
   	if (column < (this.size - 1)) {
   	this.votes[row][column + 1] += value;
   }*/
		}
	}, {
		key: '_cartesianToCell',

		/**
   * Convert a cartesian coordinate to a specific cell
   * @param  {float} x
   * @param  {float} y
   * @return {object}
   */
		value: function _cartesianToCell(x, y) {
			return {
				column: Math.floor((x + 0.5 * this.dimension) / this.precision),
				row: Math.floor((y + 0.5 * this.dimension) / this.precision)
			};
		}
	}, {
		key: '_cellToCartesian',

		/**
   * Convert a cell to cartesian coordinates
   * @param  {int} row
   * @param  {int} column
   * @return {object}
   */
		value: function _cellToCartesian(row, column) {
			return {
				x: (column + 0.5) * this.precision - 0.5 * this.dimension,
				y: (row + 0.5) * this.precision - 0.5 * this.dimension
			};
		}
	}]);

	return VoteAccumulator;
})();

exports['default'] = VoteAccumulator;
module.exports = exports['default'];

},{}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.rssiToDistance = rssiToDistance;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utilMath = require('../util/math');

var SimulatedLandmarkSet = (function () {

	/**
  * Create simulated landmarks
  * @param  {Number} N              Amount of landmarks
  * @param  {Number} options.xRange Max x
  * @param  {Number} options.yRange Max y
  * @param  {Number} updateRate     Refresh rate
  * @param  {Object} landmarkConfig Landmark config
  * @return {SimulatedLandmarkSet}
  */

	function SimulatedLandmarkSet(N, _ref, updateRate, landmarkConfig) {
		var xRange = _ref.xRange;
		var yRange = _ref.yRange;

		_classCallCheck(this, SimulatedLandmarkSet);

		this.landmarks = [];
		this.xRange = xRange;
		this.yRange = yRange;
		this.updateRate = updateRate;
		this.landmarkConfig = landmarkConfig;
		this.broadcastId = undefined;

		for (var i = 0; i < N; i++) {
			this.landmarks.push(this._randomLandmark('landmark-' + i));
		}
	}

	_createClass(SimulatedLandmarkSet, [{
		key: 'startBroadcast',

		/**
   * Start broadcasting landmark data
   * @param  {Sensor} sensor
   * @param  {User} user
   * @return {void}
   */
		value: function startBroadcast(sensor, user) {
			var _this = this;

			this.broadcastId = window.setTimeout(function () {
				return _this._broadCast(sensor, user);
			}, this.updateRate);
		}
	}, {
		key: 'stopBroadCast',

		/**
   * Stop broadcast of landmark data
   * @return {void}
   */
		value: function stopBroadCast() {
			if (this.broadcastId !== undefined) {
				window.clearTimeout(this.broadcastId);
			}
		}
	}, {
		key: 'setUpdateRate',

		/**
   * Set the update rate of the landmarks
   * @param {float} updateRate
   * @return {SimulatedLandmarkSet}
   */
		value: function setUpdateRate(updateRate) {
			this.updateRate = updateRate;

			return this;
		}
	}, {
		key: 'measurementsAtPoint',

		/**
   * Simulate RSSI measurements for all landmarks in range
   * @param  {float} x
   * @param  {float} y
   * @return {Array}
   */
		value: function measurementsAtPoint(x, y) {
			var landmarks = this.landmarksInRange(x, y);
			var measurements = [];

			return landmarks.forEach(function (l) {
				return measurements.push({ uid: l.uid, rssi: l.rssiAt(x, y), name: l.name });
			});
		}
	}, {
		key: 'randomMeasurementAtPoint',

		/**
   * Get a random measurement from a device in range
   * @param  {float} x
   * @param  {float} y
   * @return {object}
   */
		value: function randomMeasurementAtPoint(x, y) {
			var landmarks = this.landmarksInRange(x, y);

			if (landmarks.length > 0) {
				var landmark = landmarks[Math.floor(Math.random() * landmarks.length)];

				return { uid: landmark.uid, rssi: landmark.rssiAt(x, y), name: landmark.name };
			}
		}
	}, {
		key: 'landmarksInRange',

		/**
   * Return all landmarks within range of a given x,y position
   * @param  {float} x
   * @param  {float} y
   * @return {Array}
   */
		value: function landmarksInRange(x, y) {
			return this.landmarks.filter(function (l) {
				return l.isInRange(x, y);
			});
		}
	}, {
		key: '_randomLandmark',

		/**
   * Create a landmark at a random position
   * @param  {string} uid UID
   * @return {Landmark}
   */
		value: function _randomLandmark(uid) {
			return new Landmark(uid, {
				x: Math.random() * (2 * this.xRange) - this.xRange,
				y: Math.random() * (2 * this.yRange) - this.yRange
			}, this.landmarkConfig);
		}
	}, {
		key: '_broadCast',

		/**
   * Simulate a broadcast
   *
   * Sets a timeout to run this function again after a fixed amount of time
   * @param  {Sensor} sensor
   * @param  {User} user
   * @return {void}
   */
		value: function _broadCast(sensor, user) {
			var _this2 = this;

			var measurement = this.randomMeasurementAtPoint(user.x, user.y);

			if (measurement !== undefined) {
				sensor.addObservation(measurement);
			}

			this.broadcastId = window.setTimeout(function () {
				return _this2._broadCast(sensor, user);
			}, this.updateRate);
		}
	}, {
		key: 'landmarkByUid',

		/**
   * Get a landmark by its uid
   * @param  {string} uid
   * @return {Landmark}
   */
		value: function landmarkByUid(uid) {
			for (var i = 0; i < this.landmarks.length; i++) {
				if (this.landmarks[i].uid == uid) {
					return this.landmarks[i];
				}
			}
		}
	}]);

	return SimulatedLandmarkSet;
})();

exports.SimulatedLandmarkSet = SimulatedLandmarkSet;
exports['default'] = SimulatedLandmarkSet;

var Landmark = (function () {
	/**
  * Landmark
  * @param  {string} uid             UID of the landmark
  * @param  {float} options.x        Current x position
  * @param  {float} options.y        Current y position
  * @param  {int} options.n          Path loss exponent
  * @param  {int} options.txPower    Transmit power
  * @param  {float} options.noise    Noise level
  * @param  {int} options.range      Range
  * @return {Landmark}
  */

	function Landmark(uid, _ref2, _ref3) {
		var x = _ref2.x;
		var y = _ref2.y;
		var n = _ref3.n;
		var txPower = _ref3.txPower;
		var noise = _ref3.noise;
		var range = _ref3.range;

		_classCallCheck(this, Landmark);

		this.uid = uid;
		this.x = x;
		this.y = y;
		this.landmarkRange = range;
		this.n = n;
		this.txPower = txPower;
		this.noise = noise;
		this.name = uid;
	}

	_createClass(Landmark, [{
		key: 'isInRange',

		/**
   * Returns true when a point x,y is in range
   * @param  {float}  x
   * @param  {float}  y
   * @return {Boolean}
   */
		value: function isInRange(x, y) {
			return this.distanceTo(x, y) <= this.landmarkRange;
		}
	}, {
		key: 'distanceTo',

		/**
   * Distance from this landmark to a x,y point
   * @param  {float} x
   * @param  {float} y
   * @return {float}
   */
		value: function distanceTo(x, y) {
			return Math.sqrt(Math.pow(this.x - x, 2) + Math.pow(this.y - y, 2));
		}
	}, {
		key: 'rssiAtRaw',

		/**
   * RSSI value without noise at x,y point
   * @param  {float} x
   * @param  {float} y
   * @return {float} RSSI value
   */
		value: function rssiAtRaw(x, y) {
			return this.txPower - 10 * this.n * (0, _utilMath.log)(Math.max(this.distanceTo(x, y), 0.1), 10);
		}
	}, {
		key: 'rssiAt',

		/**
   * RSSI with noise at x,y point
   * @param  {float} x
   * @param  {float} y
   * @return {float}
   */
		value: function rssiAt(x, y) {
			return this.rssiAtRaw(x, y) + (0, _utilMath.randn)(0, this.noise);
		}
	}]);

	return Landmark;
})();

exports['default'] = Landmark;

/**
 * Convert RSSI to distance
 * @param  {float} rssi
 * @param  {object} landmarkConfig Should at least contain a txPower and n field
 * @return {float}
 */

function rssiToDistance(rssi, landmarkConfig) {
	return Math.pow(10, (rssi - landmarkConfig.txPower) / (-10 * landmarkConfig.n));
}

},{"../util/math":14}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _modelsParticleSet = require('./models/particle-set');

var _modelsParticleSet2 = _interopRequireDefault(_modelsParticleSet);

var _modelsSensor = require('./models/sensor');

var _modelsSensor2 = _interopRequireDefault(_modelsSensor);

var _devicePedometer = require('./device/pedometer');

var _devicePedometer2 = _interopRequireDefault(_devicePedometer);

var SlacController = (function () {

	/**
  * Main controller for SLAC
  * @param  {Number} nParticles       Number of particles
  * @param  {Object} defaultPose      Starting pose of particles
  * @param  {Object} landmarkConfig   Landmark configuration
  * @param  {Number} motionUpdateRate Motion update frequency
  * @param  {Number} stepSize
  * @return {SlacController}
  */

	function SlacController(config) {
		var _this = this;

		_classCallCheck(this, SlacController);

		//Initialize a new particle set at 'defaultPose'
		this.particleSet = new _modelsParticleSet2['default'](config.particles.N, config.particles.user);

		//Create a new sensor that tracks signal strengths
		this.sensor = new _modelsSensor2['default'](config.landmarkConfig, config.sensor.rssi.kalman, config.sensor.rssi.minMeasurements);

		//Create new pedometer to count steps
		this.pedometer = new _devicePedometer2['default'](config.sensor.motion.frequency);
		this.pedometer.onStep(function () {
			return _this._update();
		});

		//Create a local copy of the current heading
		this.heading = config.particles.user.defaultPose.theta;

		//Step size of a single step in meters
		this.stepSize = config.pedometer.stepSize;

		this.started = false;
		this.callback = undefined;
		this.lastObservations = [];
	}

	_createClass(SlacController, [{
		key: 'start',

		/**
   * Start the controller
   * @return {SlacController}
   */
		value: function start() {
			this.started = true;

			return this;
		}
	}, {
		key: 'pause',

		/**
   * Pause the controller
   * @return {SlacController}
   */
		value: function pause() {
			this.started = false;

			return this;
		}
	}, {
		key: 'addMotionObservation',

		/**
   * Process a new motion event
   * @param {Number} x
   * @param {Number} y
   * @param {Number} z
   */
		value: function addMotionObservation(x, y, z, heading) {

			//Update the pedometer
			this.pedometer.processMeasurement(x, y, z);

			this.heading = heading;this.dist = 0;
		}
	}, {
		key: 'addDeviceObservation',

		/**
   * Register a new device observation
   * @param {String} uid
   * @param {Number} rssi
   * @param {String} name
   */
		value: function addDeviceObservation(uid, rssi, name) {

			//Add the device observation to the sensor for filtering
			this.sensor.addObservation(uid, rssi, name);
		}
	}, {
		key: 'onUpdate',

		/**
   * Add a callback function that is run on every update
   *
   * The callback receives the particle set on each call.
   * @param  {Function} callback
   * @return {void}
   */
		value: function onUpdate(callback) {
			this.callback = callback;
		}
	}, {
		key: '_update',

		/**
   * Run the full SLAM update
   * @return {void}
   */
		value: function _update() {
			var _this2 = this;

			if (!this.started) {
				return;
			}

			console.log('[SLACjs/controller] Update running');

			//@todo Check for the amount of steps here
			var dist = 1 * this.stepSize;
			var heading = this.heading;

			//Sample a new pose for each particle in the set
			this.particleSet.samplePose({ r: dist, theta: heading });

			//Let each particle process the observations
			this.lastObservations = this.sensor.getObservations();

			this.lastObservations.forEach(function (obs) {
				_this2.particleSet.processObservation(obs);
			});

			//Resample, this is not done on every iteration and the
			//particle set determines whether a resmample is required
			this.particleSet.resample();

			if (this.callback !== undefined) {
				this.callback(this.particleSet);
			}
		}
	}]);

	return SlacController;
})();

exports['default'] = SlacController;
module.exports = exports['default'];

},{"./device/pedometer":2,"./models/particle-set":5,"./models/sensor":7}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var KalmanFilter = (function () {

	/**
  * Create 1-dimensional kalman filter
  * @param  {Number} options.R Process noise
  * @param  {Number} options.Q Measurement noise
  * @param  {Number} options.A State vector
  * @param  {Number} options.B Control vector
  * @param  {Number} options.C Measurement vector
  * @return {KalmanFilter}
  */

	function KalmanFilter() {
		var _ref = arguments[0] === undefined ? {} : arguments[0];

		var _ref$R = _ref.R;
		var R = _ref$R === undefined ? 1 : _ref$R;
		var _ref$Q = _ref.Q;
		var Q = _ref$Q === undefined ? 1 : _ref$Q;
		var _ref$A = _ref.A;
		var A = _ref$A === undefined ? 1 : _ref$A;
		var _ref$B = _ref.B;
		var B = _ref$B === undefined ? 0 : _ref$B;
		var _ref$C = _ref.C;
		var C = _ref$C === undefined ? 1 : _ref$C;

		_classCallCheck(this, KalmanFilter);

		this.R = R; // noise power desirable
		this.Q = Q; // noise power estimated

		this.A = A;
		this.C = C;
		this.B = B;
		this.cov = NaN;
		this.x = NaN; // estimated signal without noise
	}

	_createClass(KalmanFilter, [{
		key: "filter",

		/**
   * Filter a new value
   * @param  {Number} z Measurement
   * @param  {Number} u Control
   * @return {Number}
   */
		value: function filter(z) {
			var u = arguments[1] === undefined ? 0 : arguments[1];

			if (isNaN(this.x)) {
				this.x = 1 / this.C * z;
				this.cov = 1 / this.C * this.Q * (1 / this.C);
			} else {

				//Compute prediction
				var predX = this.A * this.x + this.B * u;
				var predCov = this.A * this.cov * this.A + this.R;

				//Kalman gain
				var K = predCov * this.C * (1 / (this.C * predCov * this.C + this.Q));

				//Correction
				this.x = predX + K * (z - this.C * predX);
				this.cov = predCov - K * this.C * predCov;
			}

			return this.x;
		}
	}, {
		key: "lastMeasurement",

		/**
   * Return the last filtered measurement
   * @return {Number}
   */
		value: function lastMeasurement() {
			return this.x;
		}
	}, {
		key: "setMeasurementNoise",

		/**
   * Set measurement noise Q
   * @param {Number} noise
   */
		value: function setMeasurementNoise(noise) {
			this.Q = noise;
		}
	}, {
		key: "setProcessNoise",

		/**
   * Set the process noise R
   * @param {Number} noise
   */
		value: function setProcessNoise(noise) {
			this.R = noise;
		}
	}]);

	return KalmanFilter;
})();

exports["default"] = KalmanFilter;
module.exports = exports["default"];

},{}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var LinkedList = (function () {
	/**
  * Create a new linked linst
  * @param  {LinkedList} base The previous link
  * @return LinkedList
  */

	function LinkedList() {
		var base = arguments[0] === undefined ? undefined : arguments[0];

		_classCallCheck(this, LinkedList);

		if (base !== undefined && typeof base != 'object') {
			console.error('Base must be a LinkedList');
		}

		this.list = [base];
	}

	_createClass(LinkedList, [{
		key: 'add',
		value: function add(element) {
			this.list.push(element);

			return this;
		}
	}, {
		key: 'values',

		/**
   * Return a flat array of the linked list
   * @return {Array}
   */
		value: function values() {
			var values = [];

			//First element of the list is another list or undefined
			if (this.list[0] !== undefined) {
				values = this.list[0].values();
			}

			values = values.concat(this.list.slice(1));

			return values;
		}
	}, {
		key: 'currentValues',

		/**
   * Only return the elements of this list and not of its parents
   * @return {Array}
   */
		value: function currentValues() {
			return this.list.slice(1);
		}
	}, {
		key: 'hasParent',

		/**
   * Return true when this parent has a parent list
   * @return {Boolean}
   */
		value: function hasParent() {
			return this.list[0] !== undefined;
		}
	}, {
		key: 'last',

		/**
   * Return the last object in the list
   * @return {mixed}
   */
		value: function last() {
			return this.list[this.list.length - 1];
		}
	}, {
		key: 'getBase',

		/**
   * Return the base of this linked list
   * @return {undefined|LinkedList}
   */
		value: function getBase() {
			return this.list[0];
		}
	}]);

	return LinkedList;
})();

exports['default'] = LinkedList;
module.exports = exports['default'];

},{}],14:[function(require,module,exports){
/**
 * Random following normal distribution
 * @param  {float} mean mean
 * @param  {float} sd   standard deviation
 * @return {float}
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.randn = randn;
exports.pdfn = pdfn;
exports.log = log;
exports.eigenvv = eigenvv;
exports.variance = variance;

function randn(mean, sd) {

	//Retrieved from jStat
	var u = undefined;
	var v = undefined;
	var x = undefined;
	var y = undefined;
	var q = undefined;

	do {
		u = Math.random();
		v = 1.7156 * (Math.random() - 0.5);
		x = u - 0.449871;
		y = Math.abs(v) + 0.386595;
		q = x * x + y * (0.196 * y - 0.25472 * x);
	} while (q > 0.27597 && (q > 0.27846 || v * v > -4 * Math.log(u) * u * u));

	return v / u * sd + mean;
}

/**
 * pdf for a normal distribution
 * @param  {Number} x
 * @param  {Number} mean
 * @param  {Number} sd
 * @return {Number}
 */

function pdfn(x, mean, sd) {
	return 1 / (sd * Math.sqrt(2 * Math.PI)) * Math.exp(-Math.pow(x - mean, 2) / (2 * sd * sd));
}

/**
 * Compute the log with a given base
 *
 * Used primarily as log10 is not implemented yet on mobile browsers
 * @param  {int}
 * @param  {int}
 * @return {float}
 */

function log(x, base) {
	return Math.log(x) / Math.log(base);
}

/**
 * Calculates two eigenvalues and eigenvectors from a 2x2 covariance matrix
 * @param  {Array} cov
 * @return {object}
 */

function eigenvv(cov) {

	var a = cov[0][0];
	var b = cov[0][1];
	var c = cov[1][0];
	var d = cov[1][1];

	var A = 1;
	var B = -(a + d);

	//const C = (a * d) - (c * b);

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
}

/**
 * Calculate the variance of an array given a value function
 * @param  {Array} data
 * @param  {Function} valueFunc Function that maps an array element to a number
 * @return {Number}
 */

function variance(data, valueFunc) {

	var sum = 0;
	var sumSq = 0;
	var n = data.length;

	data.forEach(function (d) {

		var value = valueFunc(d);

		sum += value;
		sumSq += value * value;
	});

	return (sumSq - sum * sum / n) / n;
}

},{}],15:[function(require,module,exports){
/**
 * Convert an angle in degrees to a radian angle and substract the base
 *
 * Base corresponds to theta=0. Degrees are converted from CW to CWW.
 *
 * @param  {Number} heading Angle in degrees
 * @param  {Number} base Base angle in degrees
 * @return {Number} between -pi and pi
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.degreeToNormalisedHeading = degreeToNormalisedHeading;
exports.addTheta = addTheta;
exports.limitTheta = limitTheta;
exports.meanHeading = meanHeading;
exports.polarToCartesian = polarToCartesian;
exports.cartesianToPolar = cartesianToPolar;
exports.degreeToRadian = degreeToRadian;
exports.clockwiseToCounterClockwise = clockwiseToCounterClockwise;
exports.rotationToLocalNorth = rotationToLocalNorth;

function degreeToNormalisedHeading(heading, base) {

	var diff = heading - base;

	if (diff < 0) {
		diff += 360;
	} else if (diff > 360) {
		diff -= 360;
	}

	return limitTheta(degreeToRadian(clockwiseToCounterClockwise(diff)));
}

/**
 * Add two radials, keeps the result within [-pi, pi]
 * @param {float} t1
 * @param {float} t2
 * @return {float} Sum of t1 and t2
 */

function addTheta(t1, t2) {
	console.error('Function is deprecated, use limitTheta instead.');

	var theta = t1 + t2;

	if (theta > Math.PI) {
		return Math.PI - theta;
	} else if (theta < -Math.PI) {
		return -Math.PI - theta;
	}

	return theta;
}

/**
 * Make sure theta remains between [-pi, pi]
 * @param  {Number} theta
 * @return {Number}
 */

function limitTheta(theta) {

	if (theta > Math.PI) {
		return theta - Math.PI * 2;
	} else if (theta < -Math.PI) {
		return theta + Math.PI * 2;
	}

	return theta;
}

/**
 * Compute the average heading between two angles
 * @param  {Number} theta1
 * @param  {Number} theta2
 * @return {Number}
 * @see https://en.wikipedia.org/wiki/Mean_of_circular_quantities
 */

function meanHeading(theta1, theta2) {

	var oldTheta1 = theta1;
	var oldTheta2 = theta2;

	if (theta1 < 0) {
		theta1 += 2 * Math.PI;
	}
	if (theta2 < 0) {
		theta2 += 2 * Math.PI;
	}

	var _polarToCartesian = polarToCartesian(1, theta1);

	var x1 = _polarToCartesian.dx;
	var y1 = _polarToCartesian.dy;

	var _polarToCartesian2 = polarToCartesian(1, theta2);

	var x2 = _polarToCartesian2.dx;
	var y2 = _polarToCartesian2.dy;

	var avgX = (x1 + x2) / 2;
	var avgY = (y1 + y2) / 2;

	var _cartesianToPolar = cartesianToPolar(avgX, avgY);

	var heading = _cartesianToPolar.theta;

	console.log({ oldTheta1: oldTheta1, oldTheta2: oldTheta2, theta1: theta1, theta2: theta2, heading: heading });

	return heading;
}

/**
 * Convert polar coordinates to cartesian coordinates
 * @param  {float} r
 * @param  {float} theta
 * @return {object}
 */

function polarToCartesian(r, theta) {
	var dx = r * Math.cos(theta);
	var dy = r * Math.sin(theta);

	return { dx: dx, dy: dy };
}

/**
 * Convert cartesian coordiantes to polar coordinates
 * @param  {float} dx  x value from 0,0
 * @param  {float} dy  y value from 0,0
 * @return {object}
 */

function cartesianToPolar(dx, dy) {

	var r = Math.sqrt(dx * dx + dy * dy);

	var theta = Math.atan2(dy, dx);

	return { r: r, theta: theta };
}

/**
 * Convert a value in degrees to a radian value
 * @param  {Number} degrees
 * @return {Number}
 */

function degreeToRadian(degrees) {
	return degrees * (Math.PI / 180);
}

/**
 * Convert a clockwise degree to a counter clockwise degree
 * @param  {Number} degrees
 * @return {Number}
 */

function clockwiseToCounterClockwise(degrees) {
	return 360 - degrees;
}

/**
 * Finds the smallest rotation to the local north (wich is 90deg on a radial axis)
 * @param  {Number} degrees
 * @return {Number}
 */

function rotationToLocalNorth(degrees) {

	var left = degrees - 90;
	var right = 360 - degrees + 90;

	return Math.min(left, right);
}

},{}],16:[function(require,module,exports){
/**
 * Normalize a set of weights
 * @param  {Array} weights
 * @return {Array}
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.normalizeWeights = normalizeWeights;
exports.weightedCumulativeSum = weightedCumulativeSum;
exports.lowVarianceSampling = lowVarianceSampling;
exports.rouletteWheelSampling = rouletteWheelSampling;
exports.numberOfEffectiveParticles = numberOfEffectiveParticles;

function normalizeWeights(weights) {
	var totalWeight = weights.reduce(function (total, w) {
		return total + w;
	}, 0);

	return weights.map(function (w) {
		return w / totalWeight;
	});
}

/**
 * Convert an array of weights to an cumulative sum array
 * @param  {Array} weights
 * @return {Array}
 */

function weightedCumulativeSum(weights) {

	var normalisedWeights = normalizeWeights(weights);

	var total = 0;
	return normalisedWeights.map(function (w) {
		total = w + total;
		return total;
	});
}

/**
 * Samples a new set using a low variance sampler from a array of weights
 * @param {Number} nSamples Number of samples to sample
 * @param {Array} weights 	Weight array
 * @return {Array} An array with indices corresponding to the selected weights
 */

function lowVarianceSampling(nSamples, weights) {

	var M = weights.length;
	var normalizedWeights = normalizeWeights(weights);

	var rand = Math.random() * (1 / M);

	var c = normalizedWeights[0];
	var i = 0;

	var set = [];

	for (var m = 1; m <= nSamples; m++) {
		var U = rand + (m - 1) * (1 / M);

		while (U > c) {
			i = i + 1;
			c = c + normalizedWeights[i];
		}

		set.push(i);
	}

	return set;
}

/**
 * Sample using roulette wheel sampler from a array of weights
 * @param {Number} nSamples Number of samples to sample
 * @param {Array} weights 	Weight array
 * @return {Array} An array with indices corresponding to the selected weights
 */

function rouletteWheelSampling(nSamples, weights) {

	var stackedWeights = weightedCumulativeSum(weights);
	var set = [];

	for (var i = 0; i < nSamples; i++) {

		var rand = Math.random();

		for (var m = 0; m < stackedWeights.length; m++) {

			if (stackedWeights[m] >= rand) {
				set.push(m);

				break;
			}
		}
	}

	return set;
}

/**
 * Calculate the effective number of particles
 * @see http://en.wikipedia.org/wiki/Particle_filter#Sequential_importance_resampling_.28SIR.29
 * @return {Number}
 */

function numberOfEffectiveParticles(weights) {
	var normalisedWeights = normalizeWeights(weights);

	return 1 / normalisedWeights.reduce(function (total, w) {
		return total + w * w;
	});
}

},{}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var ReplayRenderer = (function () {
	function ReplayRenderer(element, landmarkPositions) {
		var xMax = arguments[2] === undefined ? 10 : arguments[2];
		var yMax = arguments[3] === undefined ? 10 : arguments[3];
		var offsetX = arguments[4] === undefined ? 0.5 : arguments[4];
		var offsetY = arguments[5] === undefined ? 0.5 : arguments[5];

		_classCallCheck(this, ReplayRenderer);

		this.element = element;
		this.canvas = document.getElementById(element);
		this.ctx = this.canvas.getContext('2d');

		this.trueLandmarkPositions = landmarkPositions;

		this.xMax = xMax;
		this.yMax = yMax;
		this.offsetX = offsetX;
		this.offsetY = offsetY;

		this._resizeCanvas();
		this.scaleFactor = this._calculateScaleFactor();
	}

	_createClass(ReplayRenderer, [{
		key: 'render',
		value: function render(particleSet) {
			var _this = this;

			this.clearCanvas();

			var best = particleSet.bestParticle();

			particleSet.particles().forEach(function (p) {

				if (p === best) {
					return;
				}

				_this._plotUserTrace(p.user, '#CCCCCC', 0.5);
			});

			//Plot any landmark init filters
			var color = 50;

			particleSet.landmarkInitSet.particleSetMap.forEach(function (landmarkPf) {
				landmarkPf.particles.forEach(function (p) {
					_this._plotObject(p, 'rgb(0,' + color + ',0)', 5);
				});

				color += 50;
			});

			//Plot the best user trace
			this._plotUserTrace(best.user, '#24780D');

			//Plot the landmarks of the best particle
			best.landmarks.forEach(function (landmark) {
				_this._plotObject(landmark, '#B52B2B', 10);
			});

			//Plot the true landmarks
			for (var _name in this.trueLandmarkPositions) {
				if (this.trueLandmarkPositions.hasOwnProperty(_name)) {

					var landmark = this.trueLandmarkPositions[_name];
					landmark.name = _name;

					this._plotObject(landmark, '#000000', 10);
				}
			}

			return this;
		}
	}, {
		key: 'clearCanvas',

		/**
  * Clear the canvas
  * @return {ReplayRenderer}
  */
		value: function clearCanvas() {

			//Save transformation matrix
			this.ctx.save();

			//Reset the transform to clear the whole canvas
			this.ctx.setTransform(1, 0, 0, 1, 0, 0);
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

			//Restore transformation
			this.ctx.restore();

			return this;
		}
	}, {
		key: '_resizeCanvas',

		/**
  * Resize the canvas for retina devices
  * @return {void}
  */
		value: function _resizeCanvas() {

			var cs = window.getComputedStyle(this.canvas);
			var width = parseInt(cs.getPropertyValue('width'), 10);
			var height = parseInt(cs.getPropertyValue('height'), 10);

			//Calcuate a factor for the resolution
			//Use 1.99 scale on retina devices
			var resolutionFactor = window.devicePixelRatio && window.devicePixelRatio === 2 ? 1.99 : 1;

			//Make the canvas smaller with css
			this.canvas.width = width * resolutionFactor;
			this.canvas.height = height * resolutionFactor;
			this.canvas.style.width = width + 'px';
			this.canvas.style.height = height + 'px';
		}
	}, {
		key: '_calculateScaleFactor',

		/**
   * Scale the canvas to zoom in
   * @return {void}
   */
		value: function _calculateScaleFactor() {

			var width = this.canvas.width;
			var height = this.canvas.height;

			//Calculate maximal possible scalefactor
			var scaleXMax = width / (this.xMax + this.offsetX);
			var scaleYMax = height / (this.yMax + this.offsetY);

			return Math.min(scaleXMax, scaleYMax);
		}
	}, {
		key: '_plotUserTrace',

		/**
  * Plot a user object on the canvas
  * @param  {User} user
  * @param  {String} color
  * @param  {float} Range of the sensor
  * @return {void}
  */
		value: function _plotUserTrace(user) {
			var _this2 = this;

			var color = arguments[1] === undefined ? '#A8A8A8' : arguments[1];
			var lineWidth = arguments[2] === undefined ? 2 : arguments[2];

			this.ctx.lineJoin = 'round';
			this.ctx.lineWidth = lineWidth;
			this.ctx.fillStyle = '#960E0E';
			this.ctx.strokeStyle = color;

			this.ctx.beginPath();

			var resize = false;

			user.trace.values().forEach(function (_ref, i) {
				var x = _ref.x;
				var y = _ref.y;
				var theta = _ref.theta;

				var tX = _this2._tx(x);
				var tY = _this2._ty(y);

				if (i === 0) {
					_this2.ctx.moveTo(tX, tY);
				} else {
					_this2.ctx.lineTo(tX, tY);
				}
			});

			this.ctx.stroke();
			this.ctx.closePath();

			return resize;
		}
	}, {
		key: '_tx',

		/**
  * Translate x
  * @param  {Number} x
  * @return {Number}
  */
		value: function _tx(x) {
			return (x + this.offsetX) * this.scaleFactor;
		}
	}, {
		key: '_ty',

		/**
   * Translate y
   * @param  {Number} y
   * @return {Number}
   */
		value: function _ty(y) {
			return (this.yMax - (y + this.offsetY)) * this.scaleFactor;
		}
	}, {
		key: '_plotObject',

		/**
   * Plot a object
   * @param {Object} objects A objects with at least an x,y value
   * @param {string} fillStyle
   */
		value: function _plotObject(object) {
			var fillStyle = arguments[1] === undefined ? '#000000' : arguments[1];
			var size = arguments[2] === undefined ? 3 : arguments[2];

			this.ctx.fillStyle = fillStyle;

			//Compensate for landmark size
			var x = this._tx(object.x) - 0.5 * size;
			var y = this._ty(object.y) - 0.5 * size;

			this.ctx.fillRect(x, y, size, size);

			if (object.name !== undefined) {
				this.ctx.font = '15px serif';
				this.ctx.fillStyle = '#000000';
				this.ctx.fillText(object.name, x, y);
			}
		}
	}]);

	return ReplayRenderer;
})();

exports['default'] = ReplayRenderer;
module.exports = exports['default'];

},{}],18:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _slacController = require('./slac-controller');

var _slacController2 = _interopRequireDefault(_slacController);

var _viewReplayRenderer = require('./view/replay-renderer');

var _viewReplayRenderer2 = _interopRequireDefault(_viewReplayRenderer);

var _utilMotion = require('./util/motion');

/**
 * Application object for replaying recorded data
 * @type {Object}
 */
window.SlacApp = {

    bleEventIteration: 0,
    motionEventIteration: 0,

    controller: undefined,
    renderer: undefined,

    bleInterval: undefined,
    motionInterval: undefined,

    lastUpdate: 0,

    startMotionTimestamp: 0,
    currentMotionTimestamp: 0,

    startHeading: 0,

    distPlots: {},

    initialize: function initialize() {

        if (SlacJsData === undefined) {
            console.error('No replay data found');
        }

        if (SlacJsLandmarkPositions === undefined) {
            console.error('No true landmark positions found');
        }

        if (SlacJsStartingPosition === undefined) {
            console.error('No starting position found');
        }

        //Create a renderer for the canvas view
        this.renderer = new _viewReplayRenderer2['default']('slacjs-map', SlacJsLandmarkPositions);

        //Create a plot for the rssi data
        for (name in SlacJsLandmarkPositions) {
            if (SlacJsLandmarkPositions.hasOwnProperty(name)) {

                this._createDistPlot(name);
            }
        }
    },

    start: function start() {
        var _this = this;

        //Store the current heading
        this.startHeading = SlacJsData.motion[0].heading;

        //Update the initial pose with the true starting position
        _config2['default'].particles.user.defaultPose.x = SlacJsStartingPosition.x;
        _config2['default'].particles.user.defaultPose.y = SlacJsStartingPosition.y;

        //Create a new controller
        this.controller = new _slacController2['default'](_config2['default']);

        //We hack the controller to update the BLE observations before we run the internal update function
        this.controller.pedometer.onStep(function () {

            _this._updateBleObservations(_this.currentMotionTimestamp);
            _this.controller._update();

            //Take the last observations and output the measurement error
            //for the best particle
            var user = _this.controller.particleSet.userEstimate();

            _this.controller.lastObservations.forEach(function (obs) {
                var trueDist = _this.distanceToBeacon(user.x, user.y, obs.name);

                _this._updateDistPlot(obs.name, trueDist, obs.r);
            });
        });

        this.controller.start();

        //Bind renderer to controller
        this.controller.onUpdate(function (particles) {
            return _this.renderer.render(particles);
        });

        //Save the start time, we use this to determine which BLE events to send
        this.lastUpdate = new Date().getTime();

        this.motionInterval = setInterval(function () {
            return _this._processMotionObservation();
        }, _config2['default'].sensor.frequency);
    },

    /**
     * Utility function that returns the true distance to a beacon given a x,y position
     * @param  {Number} x         Location of user
     * @param  {Number} y         Location of user
     * @param  {String} name      Beacon name
     * @return {Number}           Distance
     */
    distanceToBeacon: function distanceToBeacon(x, y, name) {

        var beacon = SlacJsLandmarkPositions[name];

        var dx = x - beacon.x;
        var dy = y - beacon.y;

        return Math.sqrt(dx * dx + dy * dy);
    },

    /**
     * Simulate a motion event
     * @return {void}
     */
    _processMotionObservation: function _processMotionObservation() {

        if (this.motionEventIteration >= SlacJsData.motion.length) {
            clearInterval(this.motionInterval);

            console.log('[SLACjs] Motion events finished');
            return;
        }

        var data = SlacJsData.motion[this.motionEventIteration];

        if (this.startMotionTimestamp === 0) {
            this.startMotionTimestamp = data.timestamp;
        }

        this.controller.addMotionObservation(data.x, data.y, data.z, (0, _utilMotion.degreeToNormalisedHeading)(data.heading, this.startHeading));

        this.currentMotionTimestamp = data.timestamp;
        this.motionEventIteration++;
    },

    /**
     * Process all BLE observations until timestamp
     * @param  {Number} timestamp
     * @return {void}
     */
    _updateBleObservations: function _updateBleObservations(timestamp) {

        var current = undefined;

        do {
            current = SlacJsData.bluetooth[this.bleEventIteration];

            this.controller.addDeviceObservation(current.address, current.rssi, current.name);
            this.bleEventIteration++;

            this._updateRssiPlot(current.name, current.rssi);
        } while (current.timestamp <= timestamp);
    },

    _createDistPlot: function _createDistPlot(name) {
        $('#dist-plots').append('<div id="' + name + '-dist"></div>');

        this.distPlots[name] = {

            data: {
                real: [],
                measured: [],
                rssi: [],
                index: 0
            },

            plot: new Highcharts.Chart({
                chart: {
                    renderTo: '' + name + '-dist' },
                title: {
                    text: '' + name },
                xAxis: {
                    title: {
                        text: 'Time'
                    }
                },
                yAxis: [{
                    title: {
                        text: 'Distance'
                    } }, {
                    title: {
                        text: 'RSSI'
                    },
                    opposite: true
                }],
                series: [{
                    name: 'Computed distance from average user (averaged over all particles) to real beacon location',
                    type: 'line',
                    yAxis: 0
                }, {
                    name: 'Measured distance to beacon using path loss model',
                    type: 'line',
                    yAxis: 0
                }, {
                    name: 'RSSI',
                    type: 'line',
                    yAxis: 1
                }]
            })
        };
    },

    _updateRssiPlot: function _updateRssiPlot(name, rssi) {

        //Filter invalid values
        if (rssi > 0) {
            rssi = null;
        }

        var plot = this.distPlots[name];
        plot.data.rssi.push([plot.data.index, rssi]);
        plot.data.index++;

        plot.plot.series[2].setData(plot.data.rssi);
    },

    _updateDistPlot: function _updateDistPlot(name, real, measured) {

        var plot = this.distPlots[name];

        plot.data.real.push([plot.data.index, real]);
        plot.data.measured.push([plot.data.index, measured]);

        plot.plot.series[0].setData(plot.data.real);
        plot.plot.series[1].setData(plot.data.measured);
    }
};

},{"./config":1,"./slac-controller":11,"./util/motion":15,"./view/replay-renderer":17}],19:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var marked0$0 = [walkPattern].map(regeneratorRuntime.mark);

var _appModelsLandmarkInitSet = require('../app/models/landmark-init-set');

var _appModelsLandmarkInitSet2 = _interopRequireDefault(_appModelsLandmarkInitSet);

if (window.test === undefined) {
	window.test = {};
}

/**
 * Pattern that the user walks
 * @yield {Number}
 */
function walkPattern() {
	var steps, stepSize, quarter, i;
	return regeneratorRuntime.wrap(function walkPattern$(context$1$0) {
		while (1) switch (context$1$0.prev = context$1$0.next) {
			case 0:
				steps = 40;
				stepSize = 2;
				quarter = steps / 4;
				i = 0;

			case 4:
				if (!(i < steps)) {
					context$1$0.next = 26;
					break;
				}

				if (!(i < quarter)) {
					context$1$0.next = 10;
					break;
				}

				context$1$0.next = 8;
				return { dx: stepSize, dy: 0 };

			case 8:
				context$1$0.next = 23;
				break;

			case 10:
				if (!(i < 2 * quarter)) {
					context$1$0.next = 15;
					break;
				}

				context$1$0.next = 13;
				return { dx: 0, dy: stepSize };

			case 13:
				context$1$0.next = 23;
				break;

			case 15:
				if (!(i < 3 * quarter)) {
					context$1$0.next = 20;
					break;
				}

				context$1$0.next = 18;
				return { dx: -stepSize, dy: 0 };

			case 18:
				context$1$0.next = 23;
				break;

			case 20:
				if (!(i < steps)) {
					context$1$0.next = 23;
					break;
				}

				context$1$0.next = 23;
				return { dx: 0, dy: -stepSize };

			case 23:
				i++;
				context$1$0.next = 4;
				break;

			case 26:
			case 'end':
				return context$1$0.stop();
		}
	}, marked0$0[0], this);
}

window.test.landmarkInit = {

	landmarkSet: undefined,
	userX: 0,
	userY: 0,
	lX: 0,
	lY: 0,
	userTrace: [],
	xMax: 50,
	yMax: 50,
	ctx: undefined,
	canvas: undefined,

	pattern: undefined,

	initialize: function initialize() {

		//Init random landmark
		this.lX = Math.random() * 30 - 15;
		this.lY = Math.random() * 30 - 15;

		this.landmarkSet = new _appModelsLandmarkInitSet2['default']();
		this.canvas = document.getElementById('test-content');
		this.ctx = this.canvas.getContext('2d');
		this.ctx.scale(10, 10);

		this.userTrace.push({ x: this.userX, y: this.userY });

		this.pattern = walkPattern();
	},

	iterate: function iterate() {
		var _pattern$next$value = this.pattern.next().value;
		var dx = _pattern$next$value.dx;
		var dy = _pattern$next$value.dy;

		this.userX = this.userX + dx;
		this.userY = this.userY + dy;

		this.userTrace.push({ x: this.userX, y: this.userY });

		var r = Math.sqrt(Math.pow(this.lX - this.userX, 2) + Math.pow(this.lY - this.userY, 2));

		this.landmarkSet.addMeasurement('uid', this.userX, this.userY, r);

		this._draw();
		console.debug('True r: ' + r);
	},

	_draw: function _draw() {
		var _this = this;

		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.fillStyle = '#000000';

		this.landmarkSet.particleSetMap.get('uid').particles.forEach(function (p) {

			var x = _this._tx(p.x);
			var y = _this._ty(p.y);

			_this.ctx.fillRect(x, y, 0.3, 0.3);
		});

		this.ctx.fillStyle = '#ff0000';
		this.userTrace.forEach(function (t) {
			return _this.ctx.fillRect(_this._tx(t.x), _this._ty(t.y), 0.5, 0.5);
		});

		this.ctx.fillStyle = '#00ff00';
		this.ctx.fillRect(this._tx(this.lX), this._ty(this.lY), 0.5, 0.5);
	},

	_tx: function _tx(x) {
		return x + this.xMax / 2;
	},

	_ty: function _ty(y) {
		return this.yMax - (y + this.yMax / 2);
	}
};

},{"../app/models/landmark-init-set":3}],20:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _appSimulationLandmark = require('../app/simulation/landmark');

var _appSimulationLandmark2 = _interopRequireDefault(_appSimulationLandmark);

var _appConfig = require('../app/config');

var _appConfig2 = _interopRequireDefault(_appConfig);

var _appUtilKalman = require('../app/util/kalman');

var _appUtilKalman2 = _interopRequireDefault(_appUtilKalman);

var _appUtilMath = require('../app/util/math');

if (window.test === undefined) {
	window.test = {};
}

window.test.rssiFilter = {

	landmark: undefined,
	kalman: undefined,

	userX: 5,
	userY: 0,

	rssiTrue: [],
	rssiRaw: [],
	rssiFiltered: [],
	error: [],
	realError: [],

	iteration: 0,

	initialize: function initialize() {

		this.landmark = new _appSimulationLandmark2['default']('uid', { x: 0, y: 0 }, _appConfig2['default'].beacons);
		this.kalman = new _appUtilKalman2['default']({
			Q: _appConfig2['default'].beacons.noise,
			R: 0.008
		});
	},

	iterate: function iterate() {

		if (this.iteration % 100 === 0) {
			this.userX += 5;
			//this.kalman.R = 1;
		}

		var rssi = this.landmark.rssiAt(this.userX, this.userY);
		var rssiTrue = this.landmark.rssiAtRaw(this.userX, this.userY);
		var rssiFiltered = this.kalman.filter(rssi);

		this.rssiTrue.push([this.iteration, rssiTrue]);
		this.rssiRaw.push([this.iteration, rssi]);
		this.rssiFiltered.push([this.iteraton, rssiFiltered]);

		this.error.push(Math.abs(rssiTrue - rssiFiltered));
		this.realError.push(Math.abs(rssiTrue - rssi));

		this.iteration++;
	},

	plot: function plot() {
		$('#test-content').highcharts({
			chart: {
				type: 'scatter'
			},
			title: {
				text: 'RSSI'
			},
			xAxis: {
				title: {
					text: 'Time'
				}
			},
			yAxis: {
				title: {
					text: 'RSSI'
				}
			},
			series: [{
				name: 'True RSSI',
				data: this.rssiTrue
			}, {
				name: 'Raw RSSI',
				data: this.rssiRaw
			}, {
				name: 'Filtered RSSI',
				type: 'line',
				data: this.rssiFiltered
			}]
		});

		$('#test-error').html(this.error.reduce(function (p, c, i) {
			return p + (c - p) / (i + 1);
		}, 0));
		$('#test-error-var').html((0, _appUtilMath.variance)(this.error, function (e) {
			return e;
		}));
		$('#test-error-real').html(this.realError.reduce(function (p, c, i) {
			return p + (c - p) / (i + 1);
		}, 0));
		$('#test-error-real-var').html((0, _appUtilMath.variance)(this.realError, function (e) {
			return e;
		}));
	}
};

},{"../app/config":1,"../app/simulation/landmark":10,"../app/util/kalman":12,"../app/util/math":14}],21:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _appModelsVoteAccumulator = require('../app/models/vote-accumulator');

var _appModelsVoteAccumulator2 = _interopRequireDefault(_appModelsVoteAccumulator);

if (window.test === undefined) {
	window.test = {};
}

window.test.voting = {

	votes: undefined,
	userX: 0,
	userY: 0,
	trace: [],

	lX: -5,
	lY: 10,

	lR: 0,
	lC: 0,

	initialize: function initialize() {
		this.votes = new _appModelsVoteAccumulator2['default'](75, 5);

		var _votes$_cartesianToCell = this.votes._cartesianToCell(this.lX, this.lY);

		var row = _votes$_cartesianToCell.row;
		var column = _votes$_cartesianToCell.column;

		this.lR = row;
		this.lC = column;

		//Create a table to show the votes
		document.getElementById('test-content').innerHTML = this._createOutputTable();
		this._displayLandmark();
	},

	iterate: function iterate() {

		this.userX += Math.random() * 4 - 2;
		this.userY += Math.random() * 6 - 3;

		this.trace.push({ x: this.userX, y: this.userY });

		var r = Math.sqrt(Math.pow(this.lX - this.userX, 2) + Math.pow(this.lY - this.userY, 2)) + (Math.random() * 6 - 3);

		this.votes.addMeasurement(this.userX, this.userY, r);

		document.getElementById('test-content').innerHTML = '';
		document.getElementById('test-content').innerHTML = this._createOutputTable();
		this._displayLandmark();
		this._displayUser();
	},

	_createOutputTable: function _createOutputTable() {

		var table = '<table>';

		table += this.votes.votes.reduce(function (output, row, rowN) {
			return output + '<tr>' + row.reduce(function (rowOutput, cell, columnN) {
				var color = 'background-color: rgba(0, 0, 0, ' + cell / 50 + ');';
				var id = rowN + '' + columnN;

				return rowOutput + '<td id="' + id + '" style="' + color + '">' + cell + '</td>';
			}, '') + '</tr>';
		}, '');

		table += '</table>';
		return table;
	},

	_displayLandmark: function _displayLandmark() {
		document.getElementById(this.lR + '' + this.lC).style.backgroundColor = 'red';
	},

	_displayUser: function _displayUser() {
		var _this = this;

		this.trace.forEach(function (pos) {
			var _votes$_cartesianToCell2 = _this.votes._cartesianToCell(pos.x, pos.y);

			var row = _votes$_cartesianToCell2.row;
			var column = _votes$_cartesianToCell2.column;

			document.getElementById(row + '' + column).style.backgroundColor = 'green';
		});
	}
};

},{"../app/models/vote-accumulator":9}]},{},[18,21,19,20])


//# sourceMappingURL=slacjs-app.js.map