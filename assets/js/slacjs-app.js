(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _ParticleSet = require('./models/particle-set');

var _ParticleSet2 = _interopRequireWildcard(_ParticleSet);

var _Visualizer = require('./view/visualizer');

var _Visualizer2 = _interopRequireWildcard(_Visualizer);

var _SimulatedUser = require('./simulation/user');

var _SimulatedUser2 = _interopRequireWildcard(_SimulatedUser);

var _SimulatedLandmarkSet = require('./simulation/landmark');

var _Sensor = require('./models/sensor');

var _Sensor2 = _interopRequireWildcard(_Sensor);

/* global window */
/* global console */
/* global math */

window.app = {

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

		this.particleSet = new _ParticleSet2['default'](40, { x: 0, y: 0, theta: 0 });
		this.visualizer = new _Visualizer2['default']('slac-map', 100, 100);
		this.user = new _SimulatedUser2['default']({ x: 0, y: 0, theta: 0 }, 2, { xRange: 50, yRange: 50, padding: 5 });
		this.landmarks = new _SimulatedLandmarkSet.SimulatedLandmarkSet(10, { xRange: 50, yRange: 50 }, 50, this.landmarkConfig);
		this.sensor = new _Sensor2['default'](this.landmarkConfig);

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
		this.visualizer.clearCanvas().plotUserTrace(this.user, 'blue', this.landmarkConfig.range).plotParticleSet(this.particleSet).plotObjects(this.landmarks.landmarks).plotLandmarkPredictions(this.particleSet.particles(), this.landmarks);
	}
};

},{"./models/particle-set":2,"./models/sensor":4,"./simulation/landmark":6,"./simulation/user":7,"./view/visualizer":11}],2:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _Particle = require('./particle');

var _Particle2 = _interopRequireWildcard(_Particle);

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

		for (var i = 0; i < nParticles; i++) {
			this.particleList.push(new _Particle2['default']({ x: x, y: y, theta: theta }));
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

			if (obs !== {}) {
				this.particleList.forEach(function (p) {
					return p.processObservation(obs);
				});
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
			var variance = this._weightVariance();
			console.log(variance);
			if (variance > 100) {
				this._lowVarianceSampling();
			}

			console.log(this.particleList.map(function (p) {
				return p.weight;
			}));
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
		key: '_lowVarianceSampling',

		/**
   * Samples a new particle set
   */
		value: function _lowVarianceSampling() {
			var M = this.particleList.length;
			var weights = this._calculateStackedWeights();
			var rand = Math.random() * (1 / M);

			var c = weights[0];
			var i = 0;

			var newParticleSet = [];

			for (var m = 1; m <= M; m++) {
				var U = rand + (m - 1) * (1 / M);

				while (U > c) {
					i = i + 1;
					c = c + weights[i];
				}

				newParticleSet.push(new _Particle2['default']({}, this.particleList[i]));
			}

			this.particleList = newParticleSet;
		}
	}, {
		key: '_weightVariance',

		/**
   * Calculates the variance of the weights
   * @return {float}
   */
		value: function _weightVariance() {
			if (this.particleList.length < 2) {
				return false;
			}

			var weights = this.particleList.map(function (p) {
				return p.weight;
			});
			var sum = weights.reduce(function (w, total) {
				return total + w;
			}, 0);
			var mean = sum / weights.length;
			console.log(mean);
			return weights.reduce(function (w, total) {
				console.log((w - mean) * (w - mean));
				return total + (w - mean) * (w - mean);
			}, 0) / weights.length;
		}
	}, {
		key: '_calculateNormalisedWeights',

		/**
   * Compute a list of normalised weights of the internal particle list
   * @return {Array}
   */
		value: function _calculateNormalisedWeights() {

			if (this.particleList.length == 1) {
				return [1];
			}

			var weights = this.particleList.map(function (p) {
				return p.weight;
			});
			var max = Math.max.apply(null, weights);
			var min = Math.min.apply(null, weights);
			var diff = max - min;

			//If all weights are equal we just return an
			//array with 1/N
			if (diff === 0) {
				var _ret = (function () {
					var nw = 1 / weights.length;
					return {
						v: weights.map(function (w) {
							return nw;
						})
					};
				})();

				if (typeof _ret === 'object') {
					return _ret.v;
				}
			}

			return weights.map(function (w) {
				return (w - min) / diff;
			});
		}
	}, {
		key: '_calculateStackedWeights',

		/**
   * Calculate a list of stacked normalised weights of the internal particle list
   * @return {Array}
   */
		value: function _calculateStackedWeights() {
			var weights = this.particleList.map(function (p) {
				return p.weight;
			});
			var min = Math.min.apply(null, weights);

			if (min < 0) {
				//Make sure all weights are above zero
				weights.forEach(function (w, i, a) {
					return a[i] = w - min;
				});
			}

			var stackedWeights = [];

			var total = 0;
			var sums = weights.map(function (w) {
				total = w + total;
				return total;
			});

			return sums.map(function (w) {
				return w / total;
			});
		}
	}, {
		key: '_weightedRandomSample',

		/**
   * Draw a weighted sample from from a list and return the index
   * @param  {Array} weights
   * @return {int}
   */
		value: function _weightedRandomSample(weights) {
			var rand = Math.random();

			for (var m = 0; m < weights.length; m++) {

				if (weights[m] > rand) {
					return m;
				}
			}

			console.error('Did not draw a sample');
		}
	}]);

	return ParticleSet;
})();

exports['default'] = ParticleSet;
module.exports = exports['default'];

},{"./particle":3}],3:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } };

var _toConsumableArray = function (arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _User = require('./user');

var _User2 = _interopRequireWildcard(_User);

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
			this.user = _User2['default'].copyUser(parent.user);
			this.landmarks = this._copyMap(parent.landmarks);
		} else {
			this.user = new _User2['default']({ x: x, y: y, theta: theta });
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

			//Do something with the control here
			//Random values for now
			var r = control.r + (1 * Math.random() - 0.5);
			var theta = control.theta + 1 * (Math.random() - 0.5);

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
		key: 'processObservation',

		/**
   * Process a new observation for a landmark
   * @param  {string} options.id The id of the landmark
   * @param  {float} options.r   Range measurement to this landmark
   * @return {Particle}
   */
		value: function processObservation(_ref2) {
			var uid = _ref2.uid;
			var r = _ref2.r;

			//Update landmark
			if (this.landmarks.has(uid)) {
				this._updateLandmark({ uid: uid, r: r });
			} else {
				this._addLandmark({ uid: uid, r: r });
			}

			return this;
		}
	}, {
		key: '_addLandmark',

		/**
   * Register a new landmark
   * @param {string} options.uid
   * @param {flaot} options.r
   */
		value: function _addLandmark(_ref3) {
			var uid = _ref3.uid;
			var r = _ref3.r;

			var _getInitialEstimate = this._getInitialEstimate(uid, r);

			var x = _getInitialEstimate.x;
			var y = _getInitialEstimate.y;

			//@todo find better values for initial covariance
			var cov = [[-0.01, -0.01], [-0.01, -0.01]];

			this.landmarks.set(uid, { x: x, y: y, cov: cov });
		}
	}, {
		key: '_updateLandmark',
		value: function _updateLandmark(_ref4) {
			var uid = _ref4.uid;
			var r = _ref4.r;

			var landmark = window.app.landmarks.landmarkByUid(uid);
			var l = this.landmarks.get(uid);
			var dx = this.user.x - l.x;
			var dy = this.user.y - l.y;

			//@todo find better values for default coviarance
			var errorCov = Math.random() - 0.5;

			var dist = Math.max(0.01, Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)));

			//Compute innovation
			var v = r - dist;

			//Compute Jacobian
			var H = [-dx / dist, -dy / dist];

			//Compute innovation covariance
			//covV = H * Cov_s * H^T + error
			var HxCov = [l.cov[0][0] * H[0] + l.cov[0][1] * H[1], l.cov[1][0] * H[0] + l.cov[1][1] * H[1]];

			var covV = HxCov[0] * H[0] + HxCov[1] * H[1] + errorCov;

			//Kalman gain
			var K = [HxCov[0] * (1 / covV), HxCov[1] * (1 / covV)];

			//Do we need to translate this? regarding robot pose
			var newX = l.x + K[0] * v;
			var newY = l.y + K[1] * v;

			var deltaCov = K[0] * K[0] * covV + K[1] * K[1] * covV;

			var newCov = [[l.cov[0][0] - deltaCov, l.cov[0][1] - deltaCov], [l.cov[1][0] - deltaCov, l.cov[1][1] - deltaCov]];

			//console.log(-1 * (v * (1 / covV) * v));
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
	}, {
		key: '_getInitialEstimate',

		/**
   * Get an initial estimate of a particle
   * @param  {string} uid
   * @param  {float} r
   * @return {object}
   */
		value: function _getInitialEstimate(uid, r) {
			//Cheat here for now to get a rough estimate
			//Start ugly hack, should be removed when we have
			//a good way to estimate the initial position
			var landmark = window.app.landmarks.landmarkByUid(uid);
			var trueX = landmark.x;
			var trueY = landmark.y;

			return { x: trueX + (3 * Math.random() - 1.5), y: trueY + (3 * Math.random() - 1.5) };
		}
	}]);

	return Particle;
})();

exports['default'] = Particle;
module.exports = exports['default'];

},{"./user":5}],4:[function(require,module,exports){
"use strict";

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
	value: true
});

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

},{}],5:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _addTheta$polarToCartesian = require('../util/coordinate-system');

var _LinkedList = require('../util/linked-list');

var _LinkedList2 = _interopRequireWildcard(_LinkedList);

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
			this.trace = new _LinkedList2['default']().add({ x: x, y: y, theta: theta });
		} else {
			//We use a LinkedList here to make use of the reference to the
			//trace instead of copying the whole list
			this.trace = new _LinkedList2['default'](trace);
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

			var dTheta = _addTheta$polarToCartesian.addTheta(theta, this.theta);

			var _polarToCartesian = _addTheta$polarToCartesian.polarToCartesian(r, dTheta);

			var dx = _polarToCartesian.dx;
			var dy = _polarToCartesian.dy;

			this.x += dx;
			this.y += dy;
			this.theta = dTheta;

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

},{"../util/coordinate-system":8,"../util/linked-list":9}],6:[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, '__esModule', {
	value: true
});

/**
 * Convert RSSI to distance
 * @param  {float} rssi
 * @param  {object} landmarkConfig Should at least contain a txPower and n field
 * @return {float}
 */
exports.rssiToDistance = rssiToDistance;

var _log$randn = require('../util/math');

var SimulatedLandmarkSet = (function () {
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
		value: function startBroadcast(sensor, user) {
			var _this = this;

			this.broadcastId = window.setTimeout(function () {
				return _this._broadCast(sensor, user);
			}, this.updateRate);
		}
	}, {
		key: 'stopBroadCast',
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
			return -(10 * this.n) * _log$randn.log(Math.max(this.distanceTo(x, y), 0.1), 10) + this.txPower;
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
			return this.rssiAtRaw(x, y) + _log$randn.randn(0, this.noise);
		}
	}]);

	return Landmark;
})();

function rssiToDistance(rssi, landmarkConfig) {
	return Math.pow(10, (rssi - landmarkConfig.txPower) / (-10 * landmarkConfig.n));
}

},{"../util/math":10}],7:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _User2 = require('../models/user');

var _User3 = _interopRequireWildcard(_User2);

var _randn = require('../util/math');

var _polarToCartesian$cartesianToPolar$addTheta = require('../util/coordinate-system');

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
	}

	_inherits(SimulatedUser, _User);

	_createClass(SimulatedUser, [{
		key: 'randomWalk',

		/**
   * Make a semi-random warlk
   * @return {SimulatedUser}
   */
		value: function randomWalk() {
			var r = Math.abs(_randn.randn(this.v, 1));
			var theta = _randn.randn(0.1, 0.2);

			//Save the current x,y locally
			var lastX = this.x;
			var lastY = this.y;

			var _polarToCartesian = _polarToCartesian$cartesianToPolar$addTheta.polarToCartesian(r, _polarToCartesian$cartesianToPolar$addTheta.addTheta(theta, this.theta));

			var dx = _polarToCartesian.dx;
			var dy = _polarToCartesian.dy;

			var newX = lastX + dx;
			var newY = lastY + dy;

			//Constrain the user position and compute the actual dx,dy values
			if (newX > this.xRange - this.padding) {
				newX = this.xRange - this.padding;
			} else if (newX < -this.xRange + this.padding) {
				newX = -this.xRange + this.padding;
			}

			if (newY > this.yRange - this.padding) {
				newY = this.yRange - this.padding;
			} else if (newY < -this.yRange + this.padding) {
				newY = -this.yRange + this.padding;
			}

			//Compute the new control
			var control = _polarToCartesian$cartesianToPolar$addTheta.cartesianToPolar(newX - lastX, newY - lastY);

			//Update theta by substracting the current pose
			control.theta -= this.theta;

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
	}]);

	return SimulatedUser;
})(_User3['default']);

exports['default'] = SimulatedUser;
module.exports = exports['default'];

},{"../models/user":5,"../util/coordinate-system":8,"../util/math":10}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
/**
 * Add two radials
 * @param {float} t1
 * @param {float} t2
 * @return {float} Sum of t1 and t2
 */
exports.addTheta = addTheta;

/**
 * Convert polar coordinates to cartesian coordinates
 * @param  {float} r
 * @param  {float} theta
 * @return {object}
 */
exports.polarToCartesian = polarToCartesian;

/**
 * Convert cartesian coordiantes to polar coordinates
 * @param  {float} dx  x value from 0,0
 * @param  {float} dy  y value from 0,0
 * @return {object}
 */
exports.cartesianToPolar = cartesianToPolar;

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

function polarToCartesian(r, theta) {
	var dx = r * Math.cos(theta);
	var dy = r * Math.sin(theta);

	return { dx: dx, dy: dy };
}

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

},{}],9:[function(require,module,exports){
"use strict";

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
	value: true
});

var LinkedList = (function () {
	/**
  * Create a new linked linst
  * @param  {LinkedList} base The previous link
  * @return LinkedList
  */

	function LinkedList() {
		var base = arguments[0] === undefined ? undefined : arguments[0];

		_classCallCheck(this, LinkedList);

		if (base !== undefined && typeof base != "object") {
			console.error("Base must be a LinkedList");
		}

		this.list = [base];
	}

	_createClass(LinkedList, [{
		key: "add",
		value: function add(element) {
			this.list.push(element);

			return this;
		}
	}, {
		key: "values",

		/**
   * Return a flat array of the linked list
   * @return {Array}
   */
		value: (function (_values) {
			function values() {
				return _values.apply(this, arguments);
			}

			values.toString = function () {
				return _values.toString();
			};

			return values;
		})(function () {
			var values = [];

			//First element of the list is another list or undefined
			if (this.list[0] !== undefined) {
				values = this.list[0].values();
			}

			values = values.concat(this.list.slice(1));

			return values;
		})
	}, {
		key: "last",

		/**
   * Return the last object in the list
   * @return {mixed}
   */

		value: function last() {
			return this.list[this.list.length - 1];
		}
	}, {
		key: "getBase",

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

exports["default"] = LinkedList;
module.exports = exports["default"];

},{}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Random following normal distribution
 * @param  {float} mean mean
 * @param  {float} sd   standard deviation
 * @return {float}      
 */
exports.randn = randn;

/**
 * Compute the log with a given base
 *
 * Used primarily as log10 is not implemented yet on mobile browsers
 * 
 * @param  {int}
 * @param  {int}
 * @return {float}
 */
exports.log = log;

function randn(mean, sd) {

  //Retrieved from jStat
  var u = undefined,
      v = undefined,
      x = undefined,
      y = undefined,
      q = undefined,
      mat = undefined;

  do {
    u = Math.random();
    v = 1.7156 * (Math.random() - 0.5);
    x = u - 0.449871;
    y = Math.abs(v) + 0.386595;
    q = x * x + y * (0.196 * y - 0.25472 * x);
  } while (q > 0.27597 && (q > 0.27846 || v * v > -4 * Math.log(u) * u * u));

  return v / u * sd + mean;
}

function log(x, base) {
  return Math.log(x) / Math.log(base);
}

},{}],11:[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, '__esModule', {
	value: true
});

var Visualizer = (function () {
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
			var size = 0.5;

			objects.forEach(function (o) {

				//Compensate for landmark size
				var x = _this3._tx(o.x) - 0.5 * size;
				var y = _this3._ty(o.y) - 0.5 * size;

				_this3.ctx.fillRect(x, y, size, size);
			});

			return this;
		}
	}, {
		key: 'plotLandmarkPredictions',
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

},{}]},{},[1])


//# sourceMappingURL=slacjs-app.js.map