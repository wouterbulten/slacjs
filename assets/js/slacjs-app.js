(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
		var nParticles = arguments[0] === undefined ? 500 : arguments[0];
		var stdRange = arguments[1] === undefined ? 4 : arguments[1];
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

},{"./landmark-particle-set":2}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utilMath = require('../util/math');

var _utilSampling = require('../util/sampling');

var _utilCoordinateSystem = require('../util/coordinate-system');

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

				var _polarToCartesian = (0, _utilCoordinateSystem.polarToCartesian)(range, theta);

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

},{"../util/coordinate-system":10,"../util/math":12,"../util/sampling":13}],3:[function(require,module,exports){
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

	function ParticleSet(nParticles, _ref) {
		var x = _ref.x;
		var y = _ref.y;
		var theta = _ref.theta;

		_classCallCheck(this, ParticleSet);

		this.nParticles = nParticles;

		this.particleList = [];

		//Internal list to keep track of initialised landmarks
		this.initialisedLandmarks = [];
		this.landmarkInitSet = new _landmarkInitSet2['default']();

		for (var i = 0; i < nParticles; i++) {
			this.particleList.push(new _particle2['default']({ x: x, y: y, theta: theta }));
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
				(function () {
					var uid = obs.uid;
					var r = obs.r;

					if (_this.initialisedLandmarks.indexOf(uid) == -1) {
						(function () {

							//const {x: uX, y: uY} = this.userEstimate();
							var uX = window.SlacApp.user.x;
							var uY = window.SlacApp.user.y;

							_this.landmarkInitSet.addMeasurement(uid, uX, uY, r);

							var _landmarkInitSet$estimate = _this.landmarkInitSet.estimate(uid);

							var estimate = _landmarkInitSet$estimate.estimate;
							var x = _landmarkInitSet$estimate.x;
							var y = _landmarkInitSet$estimate.y;
							var varX = _landmarkInitSet$estimate.varX;
							var varY = _landmarkInitSet$estimate.varY;

							if (estimate > 0.6) {

								_this.particleList.forEach(function (p) {
									console.log({ varX: varX, varY: varY });
									p.addLandmark({ uid: uid, r: r }, { x: x, y: y }, { varX: varX, varY: varY });
								});

								_this.initialisedLandmarks.push(uid);
							}
						})();
					} else {
						_this.particleList.forEach(function (p) {
							return p.processObservation({ uid: uid, r: r });
						});
					}
				})();
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
			} else {
				console.log('Not resampling');
				console.log((0, _utilSampling.numberOfEffectiveParticles)(weights));
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
		key: 'userEstimate',

		/**
   * Get the best estimate of the current user position
   * @return {object}
   */
		value: function userEstimate() {
			var particle = this.bestParticle();

			return { x: particle.user.x, y: particle.user.y };
		}
	}]);

	return ParticleSet;
})();

exports['default'] = ParticleSet;
module.exports = exports['default'];

},{"../util/sampling":13,"./landmark-init-set":1,"./particle":4}],4:[function(require,module,exports){
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
  * @param  {float} options.x     Initial x position of user
  * @param  {float} options.y     Initial y position of user
  * @param  {float} options.theta Initial theta of user
  * @return {Particle}
  */

	function Particle(_ref) {
		var x = _ref.x;
		var y = _ref.y;
		var theta = _ref.theta;
		var parent = arguments[1] === undefined ? undefined : arguments[1];

		_classCallCheck(this, Particle);

		if (parent !== undefined) {
			this.user = _user2['default'].copyUser(parent.user);
			this.landmarks = this._copyMap(parent.landmarks);
		} else {
			this.user = new _user2['default']({ x: x, y: y, theta: theta });
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
			//@todo Improve pose sampling
			var r = Math.abs((0, _utilMath.randn)(control.r, 0.3));
			var theta = (0, _utilMath.randn)(control.theta, 0.05 * Math.PI);

			this.user.move({ r: r, theta: theta });

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
   * @param {[type]} options.x 	Initial x position
   * @param {[type]} options.y    Initial y
   * @param {[type]} options.varX Cov in X direction
   * @param {[type]} options.varY Cov in Y direction
   */
		value: function addLandmark(_ref2, _ref3) {
			var uid = _ref2.uid;
			var r = _ref2.r;
			var x = _ref3.x;
			var y = _ref3.y;

			var _ref4 = arguments[2] === undefined ? { varX: 1, varY: 1 } : arguments[2];

			var varX = _ref4.varX;
			var varY = _ref4.varY;

			//@todo find better values for initial covariance
			var landmark = {
				x: x,
				y: y,
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
		value: function processObservation(_ref5) {
			var uid = _ref5.uid;
			var r = _ref5.r;

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
			this.weight = this.weight - v * (1 / covV) * v;

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
			copy.cov = [].concat(_toConsumableArray(landmark.cov));

			return copy;
		}
	}]);

	return Particle;
})();

exports['default'] = Particle;
module.exports = exports['default'];

},{"../util/math":12,"./user":6}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Sensor = (function () {
	/**
  * Sensor
  * @param  {int} options.n
  * @param  {int} options.txPower
  * @param  {int} options.noise
  * @param  {int} options.range
  * @return {Senser}
  */

	function Sensor(_ref) {
		var n = _ref.n;
		var txPower = _ref.txPower;
		var noise = _ref.noise;
		var range = _ref.range;

		_classCallCheck(this, Sensor);

		this.landmarks = new Map();
		this.iteration = 0;
		this.landmarkConfig = { n: n, txPower: txPower, noise: noise, range: range };
	}

	_createClass(Sensor, [{
		key: "addObservation",

		/**
   * Process a new observation
   * @param {string} options.uid
   * @param {float} options.rssi
   */
		value: function addObservation(_ref2) {
			var uid = _ref2.uid;
			var rssi = _ref2.rssi;

			if (this.landmarks.has(uid)) {
				this._updateLandmark(uid, rssi);
			} else {
				this._registerLandmark(uid, rssi);
			}
		}
	}, {
		key: "getObservations",

		/**
   * Get all averaged observations since the last request
   *
   * Updates the interal iteration counter
   * @return {Array}
   */
		value: function getObservations() {
			var _this = this;

			var observedLandmarks = [];

			//Get all the landmarks that have been upated during the current iteration
			this.landmarks.forEach(function (l, uid) {
				if (l.iteration === _this.iteration) {
					observedLandmarks.push({ uid: uid, r: _this._rssiToDistance(l.rssi) });
				}
			});

			this.iteration++;

			return observedLandmarks;
		}
	}, {
		key: "_updateLandmark",

		/**
   * Update a landmark given a new rssi observation
   * @param  {float} uid
   * @param  {float} rssi
   * @return {void}
   */
		value: function _updateLandmark(uid, rssi) {

			var landmark = this.landmarks.get(uid);
			var alpha = this._computeAlpha(rssi, landmark.iteration);

			landmark.rssi = rssi * alpha + landmark.rssi * (1 - alpha);
			landmark.iteration = this.iteration;
		}
	}, {
		key: "_registerLandmark",

		/**
   * Add a new landmark to the interal list
   * @param  {string} uid  Landanme uid
   * @param  {float} rssi  Current RSSI value
   * @return {void}
   */
		value: function _registerLandmark(uid, rssi) {
			this.landmarks.set(uid, {
				uid: uid,
				rssi: rssi,
				iteration: this.iteration
			});
		}
	}, {
		key: "_computeAlpha",

		/**
   * Compute the alpha for the exponential weigthed average
   * @param  {float} rssi
   * @param  {int} previousIteration
   * @return {float}
   */
		value: function _computeAlpha(rssi, previousIteration) {
			//See http://www.hindawi.com/journals/ijdsn/aa/195297/
			//Alpha is based on the RSSI (larger values means larger alpha)
			//The difference in time defines the maximum value of alpha, this increases
			//with the time between the previous observation.
			//
			//@todo Currently we only use the timediff
			var timeDiff = Math.max(this.iteration - previousIteration, 1);

			var timeFactor = 1 - 1 / (Math.pow(timeDiff, 1.5) + 1);

			//const rssiFactor = Math.min(1, 1 - (0.5 * ((-10 - rssi) / 60)));

			return timeFactor;
		}
	}, {
		key: "_rssiToDistance",

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

exports["default"] = Sensor;
module.exports = exports["default"];

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utilCoordinateSystem = require('../util/coordinate-system');

var _utilLinkedList = require('../util/linked-list');

var _utilLinkedList2 = _interopRequireDefault(_utilLinkedList);

var User = (function () {
	/**
  * Create a new user
  * @param  {float} options.x     Starting x location of the user
  * @param  {float} options.y     Starting y location of the user
  * @param  {float} options.theta Direction of the user in radials relative to the x-axis
  * @param  {LinkedList} trace 	 Optional trace to extend
  * @return {User}
  */

	function User(_ref) {
		var x = _ref.x;
		var y = _ref.y;
		var theta = _ref.theta;
		var trace = arguments[1] === undefined ? undefined : arguments[1];

		_classCallCheck(this, User);

		this.x = x;
		this.y = y;
		this.theta = theta;

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

			var _polarToCartesian = (0, _utilCoordinateSystem.polarToCartesian)(r, theta);

			var dx = _polarToCartesian.dx;
			var dy = _polarToCartesian.dy;

			this.x += dx;
			this.y += dy;
			this.theta = theta;

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
			}, user.trace);
		}
	}]);

	return User;
})();

exports['default'] = User;
module.exports = exports['default'];

},{"../util/coordinate-system":10,"../util/linked-list":11}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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
				return measurements.push({ uid: l.uid, rssi: l.rssiAt(x, y) });
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

				return { uid: landmark.uid, rssi: landmark.rssiAt(x, y) };
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

/**
 * Convert RSSI to distance
 * @param  {float} rssi
 * @param  {object} landmarkConfig Should at least contain a txPower and n field
 * @return {float}
 */

function rssiToDistance(rssi, landmarkConfig) {
	return Math.pow(10, (rssi - landmarkConfig.txPower) / (-10 * landmarkConfig.n));
}

},{"../util/math":12}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _modelsUser = require('../models/user');

var _modelsUser2 = _interopRequireDefault(_modelsUser);

var _utilMath = require('../util/math');

var _utilCoordinateSystem = require('../util/coordinate-system');

var SimulatedUser = (function (_User) {
	/**
  * Create a simulated user
  * @param  {object} position     Position of the user
  * @param  {int} v               Speed of the user
  * @param  {int} options.xRange  Max range in x direction (both - and +)
  * @param  {int} options.yRange  Max range in y direciotn (both - and +)
  * @param  {int} options.padding Padding substracted from the max range
  * @return {SimulatedUser}
  */

	function SimulatedUser(position, v, _ref) {
		var xRange = _ref.xRange;
		var yRange = _ref.yRange;
		var padding = _ref.padding;

		_classCallCheck(this, SimulatedUser);

		_get(Object.getPrototypeOf(SimulatedUser.prototype), 'constructor', this).call(this, position);

		this.v = v;
		this.xRange = xRange;
		this.yRange = yRange;
		this.padding = padding;

		this.lastControl = { r: 0, theta: 0 };
		this.iteration = 0;
	}

	_inherits(SimulatedUser, _User);

	_createClass(SimulatedUser, [{
		key: 'setPath',
		value: function setPath(distances, angles) {
			this.distances = distances;
			this.angles = angles;
		}
	}, {
		key: 'randomWalk',

		/**
   * Make a semi-random warlk
   * @return {SimulatedUser}
   */
		value: function randomWalk() {
			var _newStep = this._newStep();

			var r = _newStep.r;
			var theta = _newStep.theta;

			//Save the current x,y locally
			var lastX = this.x;
			var lastY = this.y;

			var _polarToCartesian = (0, _utilCoordinateSystem.polarToCartesian)(r, (0, _utilCoordinateSystem.addTheta)(theta, this.theta));

			var dx = _polarToCartesian.dx;
			var dy = _polarToCartesian.dy;

			var newX = this._constrainCoordinate(lastX + dx, this.xRange - this.padding, -this.xRange + this.padding);
			var newY = this._constrainCoordinate(lastY + dy, this.yRange - this.padding, -this.yRange + this.padding);

			//Compute the new control
			var control = (0, _utilCoordinateSystem.cartesianToPolar)(newX - lastX, newY - lastY);

			//Move to the new position
			this.move({ r: control.r, theta: control.theta });

			this.lastControl = { r: control.r, theta: control.theta };

			return this;
		}
	}, {
		key: 'getLastControl',
		value: function getLastControl() {
			return this.lastControl;
		}
	}, {
		key: '_constrainCoordinate',

		/**
   * Constrain a value using a max,min value
   * @param  {Number} value
   * @param  {Number} max
   * @param  {Number} min
   * @return {Number}
   */
		value: function _constrainCoordinate(value, max, min) {
			if (value > max) {
				return max;
			} else if (value < min) {
				return min;
			}

			return value;
		}
	}, {
		key: '_newStep',

		/**
   * Generate a new step
   * @return {object}
   */
		value: function _newStep() {
			if (this.distances !== undefined && this.angles !== undefined) {
				if (this.iteration < this.distances.length) {
					var step = { r: this.distances[this.iteration], theta: this.angles[this.iteration] };
					this.iteration++;

					return step;
				} else if (this.iteration == this.distances.length) {
					console.debug('Simulater reached end of trace data');

					return { r: 0, theta: 0 };
				}

				this.iteration++;
			}

			return { r: Math.abs((0, _utilMath.randn)(this.v, 1)), theta: (0, _utilMath.randn)(0.1, 0.2) };
		}
	}]);

	return SimulatedUser;
})(_modelsUser2['default']);

exports['default'] = SimulatedUser;
module.exports = exports['default'];

},{"../models/user":6,"../util/coordinate-system":10,"../util/math":12}],10:[function(require,module,exports){
/**
 * Add two radials
 * @param {float} t1
 * @param {float} t2
 * @return {float} Sum of t1 and t2
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.addTheta = addTheta;
exports.polarToCartesian = polarToCartesian;
exports.cartesianToPolar = cartesianToPolar;
exports.degreeToRadian = degreeToRadian;
exports.rotationToLocalNorth = rotationToLocalNorth;

function addTheta(t1, t2) {
	var theta = t1 + t2;
	var twoPi = Math.PI * 2;

	if (theta > twoPi) {
		theta -= twoPi;
	} else if (theta < 0) {
		theta += twoPi;
	}

	return theta;
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

	var theta = undefined;

	//Theta can be computed using tan^-1 when x != 0
	if (dx !== 0) {
		theta = Math.atan(dy / dx);

		//Compensate for negative values of dx and dy
		if (dx < 0) {
			theta += Math.PI;
		} else if (dy < 0) {
			theta += 2 * Math.PI;
		}
	} else {
		if (dy >= 0) {
			theta = 0;
		} else {
			theta = -Math.PI;
		}
	}

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
 * Finds the smallest rotation to the local north (wich is 90deg on a radial axis)
 * @param  {Number} degrees
 * @return {Number}
 */

function rotationToLocalNorth(degrees) {

	var left = degrees - 90;
	var right = 360 - degrees + 90;

	return Math.min(left, right);
}

},{}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utilMath = require('../util/math');

var Visualizer = (function () {

	/**
  * Create new visualizer
  * @param  {String} element Id of the canvas
  * @param  {Number} xMax
  * @param  {Number} yMax
  * @return {Visualizer}
  */

	function Visualizer(element, xMax, yMax) {
		_classCallCheck(this, Visualizer);

		this.element = element;
		this.xMax = xMax;
		this.yMax = yMax;

		this.canvas = document.getElementById(element);
		this.ctx = this.canvas.getContext('2d');

		this._scaleCanvas();
	}

	_createClass(Visualizer, [{
		key: 'plotParticleSet',

		/**
   * Plot the particle set
   * @param  {ParticleSet} particleSet
   * @return {Visualizer}
   */
		value: function plotParticleSet(particleSet) {
			var _this = this;

			var best = particleSet.bestParticle();

			//Plot user traces
			particleSet.particles().forEach(function (p) {
				if (p !== best) {
					_this.plotUserTrace(p.user);
				}
			});

			//Plot best last
			this.plotUserTrace(best.user, '#11913E');

			//this.plotLandmarksErrors(best);

			return this;
		}
	}, {
		key: 'clearCanvas',

		/**
   * Clear the canvas
   * @return {Visualizer}
   */
		value: function clearCanvas() {
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

			return this;
		}
	}, {
		key: 'plotUserTrace',

		/**
   * Plot a user object on the canvas
   * @param  {User} user
   * @param  {String} color
   * @param  {float} Range of the sensor
   * @return {Visualizer}
   */
		value: function plotUserTrace(user) {
			var _this2 = this;

			var color = arguments[1] === undefined ? '#C7C7C7' : arguments[1];
			var range = arguments[2] === undefined ? undefined : arguments[2];

			//@todo This can possibly be optimised by only plotting traces that have
			//		not yet been plotted.

			this.ctx.lineJoin = 'round';
			this.ctx.lineWidth = 0.1;
			this.ctx.fillStyle = '#960E0E';
			this.ctx.strokeStyle = color;

			this.ctx.beginPath();

			user.trace.values().forEach(function (_ref, i) {
				var x = _ref.x;
				var y = _ref.y;
				var theta = _ref.theta;

				if (i === 0) {
					_this2.ctx.moveTo(_this2._tx(x), _this2._ty(y));
				} else {
					_this2.ctx.lineTo(_this2._tx(x), _this2._ty(y));
				}
			});

			this.ctx.stroke();
			this.ctx.closePath();

			if (range !== undefined) {
				this.ctx.strokeStyle = '#C7C7C7';
				this.ctx.beginPath();
				this.ctx.arc(this._tx(user.x), this._ty(user.y), range, 0, Math.PI * 2, true);
				this.ctx.stroke();
				this.ctx.closePath();
			}

			return this;
		}
	}, {
		key: 'plotObjects',

		/**
   * Plot a set of objects as squares
   * @param {Array} objects An array of objects with at least an x,y value
   * @param {string} fillStyle
   * @return {Visualizer}
   */
		value: function plotObjects(objects) {
			var _this3 = this;

			var fillStyle = arguments[1] === undefined ? '#000000' : arguments[1];

			this.ctx.fillStyle = fillStyle;
			var size = 0.35;

			objects.forEach(function (o) {

				//Compensate for landmark size
				var x = _this3._tx(o.x) - 0.35 * size;
				var y = _this3._ty(o.y) - 0.35 * size;

				_this3.ctx.fillRect(x, y, size, size);
			});

			return this;
		}
	}, {
		key: 'plotLandmarkPredictions',

		/**
   * Plot the predictions of each landmark
   * @param  {Array} particles
   * @param  {Array} landmarks
   * @param  {String} fillStyle
   * @return {Visualizer}
   */
		value: function plotLandmarkPredictions(particles) {
			var _this4 = this;

			var landmarks = arguments[1] === undefined ? undefined : arguments[1];
			var fillStyle = arguments[2] === undefined ? '#941313' : arguments[2];

			this.ctx.fillStyle = fillStyle;
			var size = 0.5;

			particles.forEach(function (p) {
				p.landmarks.forEach(function (l, uid) {

					//Compensate for landmark size
					var x = _this4._tx(l.x) - 0.5 * size;
					var y = _this4._ty(l.y) - 0.5 * size;

					_this4.ctx.fillRect(x, y, size, size);

					if (landmarks !== undefined) {
						var trueL = landmarks.landmarkByUid(uid);

						_this4.ctx.strokeStyle = '#8C7A7A';
						_this4.ctx.beginPath();
						_this4.ctx.moveTo(x, y);
						_this4.ctx.lineTo(_this4._tx(trueL.x), _this4._ty(trueL.y));
						_this4.ctx.stroke();
						_this4.ctx.closePath();
					}
				});
			});

			return this;
		}
	}, {
		key: 'plotLandmarkInitParticles',

		/**
   * Plot a landmark initialisation particle set
   * @param  {LandmarkInitializationSet} landmarkSet
   * @param  {String} fillStyle
   * @return {Visualizer}
   */
		value: function plotLandmarkInitParticles(landmarkSet) {
			var _this5 = this;

			var fillStyle = arguments[1] === undefined ? '#2EFF3C' : arguments[1];

			this.ctx.fillStyle = fillStyle;
			var size = 0.5;

			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = landmarkSet.particleSets()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var set = _step.value;

					set.particles.forEach(function (p) {

						//Compensate for landmark size
						var x = _this5._tx(p.x) - 0.5 * size;
						var y = _this5._ty(p.y) - 0.5 * size;

						_this5.ctx.fillRect(x, y, size, size);
					});
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

			return this;
		}
	}, {
		key: 'plotLandmarksErrors',

		/**
   * Plot elipses of the landmark errors
   * @param  {Particle} particle
   * @return {Visualizer}
   */
		value: function plotLandmarksErrors(particle) {
			var _this6 = this;

			particle.landmarks.forEach(function (l) {
				var _eigenvv = (0, _utilMath.eigenvv)(l.cov);

				var values = _eigenvv.values;
				var vectors = _eigenvv.vectors;

				var major = undefined;
				var minor = undefined;

				if (values[0] > values[1]) {
					major = [vectors[0][0] * Math.sqrt(values[0]), vectors[0][1] * Math.sqrt(values[0])];
					minor = [vectors[1][0] * Math.sqrt(values[1]), vectors[1][1] * Math.sqrt(values[1])];
				} else {
					major = [vectors[1][0] * Math.sqrt(values[1]), vectors[1][1] * Math.sqrt(values[1])];
					minor = [vectors[0][0] * Math.sqrt(values[0]), vectors[0][1] * Math.sqrt(values[0])];
				}

				var beginX = 0;
				var beginY = 0;
				_this6.ctx.beginPath();
				_this6.ctx.strokeStyle = '#B06D6D';
				for (var i = 0; i < 16; i++) {

					var r = Math.PI * (i / 8);
					var x = _this6._tx(minor[0] * Math.cos(r) + major[0] * Math.sin(r) + l.x);
					var y = _this6._ty(minor[1] * Math.cos(r) + major[1] * Math.sin(r) + l.y);

					if (isNaN(x)) {
						console.log({ m0: minor[0], m1: minor[1], mm0: major[0], mm1: major[1] });
						console.log({ values: values, vectors: vectors });
					}

					if (i === 0) {
						_this6.ctx.moveTo(x, y);
						beginX = x;
						beginY = y;
					} else {
						_this6.ctx.lineTo(x, y);
					}
				}

				_this6.ctx.lineTo(beginX, beginY);
				_this6.ctx.stroke();
				_this6.ctx.closePath();
			});

			return this;
		}
	}, {
		key: '_scaleCanvas',

		/**
   * Scale the canvas
   * @return {void}
   */
		value: function _scaleCanvas() {

			//Use 1.99 scale on retina devices
			var scaleFactor = window.devicePixelRatio && window.devicePixelRatio === 2 ? 1.99 : 1;

			//Get desired width of the canvas
			var width = Math.min(window.innerWidth, window.innerHeight);

			//Make the canvas smaller with css
			this.canvas.width = width * scaleFactor;
			this.canvas.height = width * scaleFactor;
			this.canvas.style.width = width + 'px';
			this.canvas.style.height = width + 'px';

			var scaleFactorX = width * scaleFactor / this.xMax;
			var scaleFactorY = width * scaleFactor / this.yMax;

			//Scale the canvas to translate coordinates to pixels
			this.ctx.scale(scaleFactorX, scaleFactorY);
		}
	}, {
		key: '_tx',
		value: function _tx(x) {
			return x + this.xMax / 2;
		}
	}, {
		key: '_ty',
		value: function _ty(y) {
			return this.yMax - (y + this.yMax / 2);
		}
	}]);

	return Visualizer;
})();

exports['default'] = Visualizer;
module.exports = exports['default'];

},{"../util/math":12}],15:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _modelsParticleSet = require('./models/particle-set');

var _modelsParticleSet2 = _interopRequireDefault(_modelsParticleSet);

var _viewVisualizer = require('./view/visualizer');

var _viewVisualizer2 = _interopRequireDefault(_viewVisualizer);

var _simulationUser = require('./simulation/user');

var _simulationUser2 = _interopRequireDefault(_simulationUser);

var _simulationLandmark = require('./simulation/landmark');

var _modelsSensor = require('./models/sensor');

var _modelsSensor2 = _interopRequireDefault(_modelsSensor);

window.SlacENV = 'debug';

window.SlacApp = {

	particleSet: undefined,
	visualizer: undefined,
	user: undefined,
	landmarks: undefined,
	sensor: undefined,

	landmarkConfig: {
		n: 2,
		txPower: -12,
		noise: 2,
		range: 20
	},

	initialize: function initialize() {
		'use strict';

		this.particleSet = new _modelsParticleSet2['default'](40, { x: 0, y: 0, theta: 0 });
		this.visualizer = new _viewVisualizer2['default']('slac-map', 100, 100);
		this.user = new _simulationUser2['default']({ x: 0, y: 0, theta: 0 }, 2, { xRange: 50, yRange: 50, padding: 5 });

		//Add simulated data to the user object
		//this._addSimulatedData();

		this.landmarks = new _simulationLandmark.SimulatedLandmarkSet(5, { xRange: 50, yRange: 50 }, 50, this.landmarkConfig);
		this.sensor = new _modelsSensor2['default'](this.landmarkConfig);

		//Start broadcasting of the simulated landmarks
		//Broadcasts are sent to the sensor, the user object is used to find nearby landmarks
		this.landmarks.startBroadcast(this.sensor, this.user);
	},

	step: function step() {
		var _this = this;

		this.user.randomWalk();

		//Get accelerometer data
		// ...

		//Transform to angle and distance
		//Simulate this by getting the control from the simulated user

		var _user$getLastControl = this.user.getLastControl();

		var r = _user$getLastControl.r;
		var theta = _user$getLastControl.theta;

		//Sample a new pose for each particle in the set
		this.particleSet.samplePose({ r: r, theta: theta });

		//Get the latest observation
		var observations = this.sensor.getObservations();

		observations.forEach(function (obs) {
			return _this.particleSet.processObservation(obs);
		});

		this.particleSet.resample();

		//Update the canvas
		this.visualizer.clearCanvas().plotUserTrace(this.user, 'blue', this.landmarkConfig.range).plotObjects(this.landmarks.landmarks).plotParticleSet(this.particleSet);

		if (window.SlacENV == 'debug') {
			this.visualizer.plotLandmarkPredictions(this.particleSet.particles(), this.landmarks);
			this.visualizer.plotLandmarkInitParticles(this.particleSet.landmarkInitSet);
		} else {
			this.visualizer.plotLandmarkPredictions([this.particleSet.bestParticle()], this.landmarks);
		}
	},

	_addSimulatedData: function _addSimulatedData() {
		var thetas = [0, 0, 0, 0, 0, 0, 0.08099418560036185, 0, 0, 0, 0, 0, 0, 0, -0.002454369260617026, 0, 0, 0, 0, 0, 0, -0.000818123086872342, 0, 0, 0, 0, 0, 0, 0, 0.000545415391248228, 0, 0, 0, 0, 0, 0, 0, 0.001636246173744684, 0, 0, 0, 0, 0, 0, -0.000272707695624114, 0, 0, 0, 0, 0, 0, 0, 0.000272707695624114, 0, 0, 0, 0, 0, 0, 0.004363323129985824, 0, 0, 0, 0, 0, 0, 0, 0.006544984694978736, 0, 0, 0, 0, 0, 0, -0.0029997846518652537, 0, 0, 0, 0, 0, 0, 0, -0.0029997846518652537, 0, 0, 0, 0, 0, 0, 0.001908953869368798, 0, 0, 0, 0, 0, 0, 0, 0.000818123086872342, 0, 0, 0, 0, 0, 0, -0.006272276999354622, 0, 0, 0, 0, 0, 0, 0, -0.001090830782496456, 0, 0, 0, 0, 0, 0, 0.08290313946973066, 0, 0, 0, 0, 0, 0, -0.00545415391248228, 0, 0, 0, 0, 0, 0, -0.11344640137963143, 0, 0, 0, 0, 0, 0, 0, -0.09272061651219876, 0, 0, 0, 0, 0, 0, 0, -0.007363107781851078, 0, 0, 0, 0, 0, 0, -0.20453077171808548, 0, 0, 0, 0, 0, 0, 0, -0.1598067096357308, 0, 0, 0, 0, 0, 0, 0, -0.1990766178056032, 0, 0, 0, 0, 0, 0, -0.241619018322965, 0, 0, 0, 0, 0, 0, 0, -0.1562615095926173, 0, 0, 0, 0, 0, 0, -0.22552926428114228, 0, 0, 0, 0, 0, 0, 0, -0.23425591054111392, 0, 0, 0, 0, 0, 0, -0.31334114227210697, 0, 0, 0, 0, 0, 0, -0.22362031041177347, 0, 0, 0, 0, 0, 0, 0, -0.0681769239060285, 0, 0, 0, 0, 0, 0, -0.12871803233458182, 0, 0, 0, 0, 0, 0, 0, -0.08426667794785123, 0, 0, 0, 0, 0, 0, 0, 0.0995383089028016, 0, 0, 0, 0, 0, 0, 0.006544984694978736, 0, 0, 0, 0, 0, 0, 0, 0.00272707695624114, 0, 0, 0, 0, 0, 0, -0.000818123086872342, 0, 0, 0, 0, 0, 0, 0, 0.0029997846518652537, 0, 0, 0, 0, 0, 0, 0, 0.003272492347489368, 0, 0, 0, 0, 0, 0, 0, 0.06899504699290084, 0, 0, 0, 0, 0, 0, 0.06599526234103559, 0, 0, 0, 0, 0, 0, 0, 0.0719948316447661, 0, 0, 0, 0, 0, 0, 0.007090400086226964, 0, 0, 0, 0, 0, 0, 0, -0.0029997846518652537, 0, 0, 0, 0, 0, 0, -0.13199052468207118, 0, 0, 0, 0, 0, 0, 0, -0.12408200150897186, 0, 0, 0, 0, 0, 0, 0, -0.1892591407631351, 0, 0, 0, 0, 0, 0, -0.13335406316019174, 0, 0, 0, 0, 0, 0, 0, -0.13717197089892932, 0, 0, 0, 0, 0, 0, 0, -0.13799009398580167, 0, 0, 0, 0, 0, 0, -0.10471975511965978, 0, 0, 0, 0, 0, 0, 0, -0.10608329359778035, 0, 0, 0, 0, 0, 0, -0.0703585854710214, 0, 0, 0, 0, 0, 0, 0, -0.004363323129985824, 0, 0, 0, 0, 0, 0, 0, 0.001090830782496456, 0, 0, 0, 0, 0, 0, 0, 0.004636030825609938, 0, 0, 0, 0, 0, 0, 0.08699375490409236, 0, 0, 0, 0, 0, 0, 0, 0.00545415391248228, 0, 0, 0, 0, 0, 0, 0.004908738521234052, 0, 0, 0, 0, 0, 0, 0, 0.002181661564992912, 0, 0, 0, 0, 0, 0, 0.000818123086872342, 0, 0, 0, 0, 0, 0, -0.001908953869368798, 0, 0, 0, 0, 0, 0, 0, -0.002181661564992912, 0, 0, 0, 0, 0, 0, 0, -0.0029997846518652537, 0, 0, 0, 0, 0, 0, -0.005726861608106394, 0, 0, 0, 0, 0, 0, -0.06463172386291502, 0, 0, 0, 0, 0, 0, 0, -0.08835729338221293, 0, 0, 0, 0, 0, 0, -0.06844963160165261, 0, 0, 0, 0, 0, 0, -0.007090400086226964, 0, 0, 0, 0, 0, 0, 0, -0.004908738521234052, 0, 0, 0, 0, 0, 0, -0.00136353847812057, 0, 0, 0, 0, 0, 0, 0.08235772407848242, 0, 0, 0, 0, 0, 0, 0, 0.09844747812030515, 0, 0, 0, 0, 0, 0, 0.17862354063379465, 0, 0, 0, 0, 0, 0, 0, 0.275162064884731, 0, 0, 0, 0, 0, 0, 0.2519819107566813, 0, 0, 0, 0, 0, 0, 0, 0.41369757426178094, 0, 0, 0, 0, 0, 0, 0.37879098922189436, 0, 0, 0, 0, 0, 0, 0, 0.5162356678164478, 0, 0, 0, 0, 0, 0, 0.4955098829490151, 0, 0, 0, 0, 0, 0, 0, 0.32288591161895097, 0, 0, 0, 0, 0, 0, 0.25443628001729834, 0, 0, 0, 0, 0, 0, 0, 0.14862569411514212, 0, 0, 0, 0, 0, 0, 0.11017390903214205, 0, 0, 0, 0, 0, 0, 0, 0.0859029241215959, 0, 0, 0, 0, 0, 0, 0.007090400086226964, 0, 0, 0, 0, 0, 0, 0, 0.007635815477475192, 0, 0, 0, 0, 0, 0, 0.007635815477475192, 0, 0, 0, 0, 0, 0, 0, 0.007363107781851078, 0, 0, 0, 0, 0, 0, 0.0029997846518652537, 0, 0, 0, 0, 0, 0, 0, -0.000272707695624114, 0, 0, 0, 0, 0, 0, -0.0719948316447661, 0, 0, 0, 0, 0, 0, 0, -0.07308566242726255, 0, 0, 0, 0, 0, 0, 0, -0.1366265555076811, 0, 0, 0, 0, 0, 0, -0.11671889372712078, 0, 0, 0, 0, 0, 0, 0, -0.07526732399225546, 0, 0, 0, 0, 0, 0, -0.001636246173744684, 0, 0, 0, 0, 0, 0, 0, 0.003817907738737596, 0, 0, 0, 0, 0, 0, 0.24461880297483024, 0, 0, 0, 0, 0, 0, 0.3239767424014474, 0, 0, 0, 0, 0, 0, 0, 0.26207209549477356, 0, 0, 0, 0, 0, 0, 0, 0.28197975727533386, 0, 0, 0, 0, 0, 0, 0.19144080232812802, 0, 0, 0, 0, 0, 0, 0, 0.13880821707267402, 0, 0, 0, 0, 0, 0, 0, 0.07063129316664553, 0, 0, 0, 0, 0, 0, 0, 0.0040906154343617095, 0, 0, 0, 0, 0, 0, 0.0040906154343617095, 0, 0, 0, 0, 0, 0, 0.00272707695624114, 0, 0, 0, 0, 0, 0, -0.001636246173744684, 0, 0, 0, 0, 0, 0, 0, -0.001908953869368798, 0, 0, 0, 0, 0, 0, -0.001636246173744684, 0, 0, 0, 0, 0, 0, 0, -0.003272492347489368, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.06299547768917033, 0, 0, 0, 0, 0, 0, 0, 0.00545415391248228, 0, 0, 0, 0, 0, 0, 0.003545200043113482, 0, 0, 0, 0, 0, 0, 0, 0.007090400086226964, 0, 0, 0, 0, 0, 0, 0.07635815477475191, 0, 0, 0, 0, 0, 0, 0, 0.09272061651219876, 0, 0, 0, 0, 0, 0, 0.20398535632683726, 0, 0, 0, 0, 0, 0, 0, 0.18953184845875923, 0, 0, 0, 0, 0, 0, 0.20153098706622025, 0, 0, 0, 0, 0, 0.1502619402888868, 0, 0, 0, 0, 0, 0, 0, 0, 0.15162547876700738, 0, 0, 0, 0, 0, 0, -6.149013120932523, 0, 0, 0, 0, 0, 0, 0.09626581655531224, 0, 0, 0, 0, 0, 0, 0, 0.09326603190344698, 0, 0, 0, 0, 0, 0, 0.007635815477475192, 0, 0, 0, 0, 0, 0, 0.007363107781851078, 0, 0, 0, 0, 0, 0, 0, 0.003817907738737596, 0, 0, 0, 0, 0, 0, 0, 0.00272707695624114, 0, 0, 0, 0, 0, 0, 0.00272707695624114, 0];
		var distances = thetas.map(function () {
			return 0.16;
		});

		this.user.setPath(distances, thetas);
	}
};

},{"./models/particle-set":3,"./models/sensor":5,"./simulation/landmark":8,"./simulation/user":9,"./view/visualizer":14}],16:[function(require,module,exports){
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
		console.log({ dx: dx, dy: dy });
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

		this.landmarkSet.particles.get('uid').particles.forEach(function (p) {

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

},{"../app/models/landmark-init-set":1}],17:[function(require,module,exports){
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

},{"../app/models/vote-accumulator":7}]},{},[15,17,16])


//# sourceMappingURL=slacjs-app.js.map