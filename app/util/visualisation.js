var visualisation = {

	canvas: {
		landmarks: undefined,
		map: undefined,
	},

	ctx: {
		landmarks: undefined,
		map: undefined,
	},

	userPath: undefined,
	landmarks: [],

	scaled: false,

	stageElement: 'slac-stage',
	canvasElements: {
		landmarks: 	'slac-map-landmarks',
		map: 		'slac-map'
	},

	dpi: 2,

	styleBase: {
		traceWidth: 5,
		particleTraceWidth: 2,
		landmarkSize: 12,
		particleSize: 6,
	},

	style: {
		traceWidth: 0,
		particleTraceWidth: 0,
		landmarkSize: 0,
		particleSize: 0,
	},

	xMax: 0,
	yMax: 0,


	init: function(xMax, yMax) {

		var canvasLandmarks = document.getElementById(this.canvasElements.landmarks);
		var canvasMap = document.getElementById(this.canvasElements.map);

		var padding = 20;

		this.canvas.landmarks = canvasLandmarks;
		this.canvas.map = canvasMap;

		this.xMax = xMax;
		this.yMax = yMax;

		this.ctx.landmarks = canvasLandmarks.getContext('2d');
		this.ctx.map = canvasMap.getContext('2d');

		if(!this.scaled) {
			this.scaleCanvas();
		}

		//Clear any remaining drawings
		this.ctx.landmarks.clearRect(0, 0, canvasLandmarks.width, canvasLandmarks.height);
		this.ctx.map.clearRect(0, 0, canvasMap.width, canvasMap.height);

		self.sx = function(x) {

			return x;
			//return x*((canvas.width() - (2 * padding))/xMax) + padding;
		}
		self.sy = function(y) {
			return y;
			//return (yMax - y) *((canvas.height() - (2 * padding))/yMax) + padding
		}
	},

	scaleCanvas: function() {

		//Get desired width of the canvas
		var width = this.dpi * Math.min(window.innerWidth, window.innerHeight);

		this.canvas.landmarks.width = width;
		this.canvas.landmarks.height = width;

		this.canvas.map.width = width;
		this.canvas.map.height = width;

		var scaleFactorX = width / this.xMax;
		var scaleFactorY = width / this.yMax;

		this.ctx.map.scale(scaleFactorX, scaleFactorY);
		this.ctx.landmarks.scale(scaleFactorX, scaleFactorY);

		this.style.traceWidth = this.styleBase.traceWidth / scaleFactorX;
		this.style.particleTraceWidth = this.styleBase.particleTraceWidth / scaleFactorX;
		this.style.landmarkSize = this.styleBase.landmarkSize / scaleFactorX;
		this.style.particleSize = this.styleBase.particleSize / scaleFactorX;
	},

	update: function(user, landmarks, particles) {

		//Clear any remaining drawings
		this.ctx.map.clearRect(0, 0, this.canvas.map.width, this.canvas.map.height);

		this.plotLandmarks(landmarks);
		this.plotUserTrace(user);
		this.plotParticles(user, particles);
	},

	plotLandmarks: function(landmarks) {

		this.ctx.landmarks.fillStyle = '#000000';

		landmarks.forEach(function(l) {

			var x = l.x - (0.5 * this.style.landmarkSize)
			var y = l.y - (0.5 * this.style.landmarkSize)

			this.ctx.landmarks.fillRect(x,y, this.style.landmarkSize, this.style.landmarkSize);

		}, this);
	},

	plotUserTrace: function(user) {

		this.ctx.map.lineJoin = 'round';
		this.ctx.map.lineWidth = this.style.traceWidth;
		this.ctx.map.strokeStyle = '#1B61D1';
		this.ctx.map.beginPath();

		user.trace.forEach(function(t, i) {
			if(i == 0) {
				this.ctx.map.moveTo(sx(t[0]), sy(t[1]));
			}
			else {
				this.ctx.map.lineTo(sx(t[0]), sy(t[1]));
			}
		}, this);

		this.ctx.map.stroke();
		this.ctx.map.closePath();
	},

	plotParticles: function(user, particles) {

		this.ctx.map.lineJoin = 'round';
		this.ctx.map.lineWidth = this.style.particleTraceWidth;
		this.ctx.map.fillStyle = '#960E0E';
		this.ctx.map.strokeStyle = '#C7C7C7';
		
		//Particles always start at 0,0 but the user can start somewhere else in the global frame
		var baseX = user.trace[0][0]
		var baseY = user.trace[0][1]

		//Plot the traces & particles
		particles.forEach(function(p) {
			
			this.ctx.map.beginPath();

			p.trace.forEach(function(t, i) {
				if(i == 0) {
					this.ctx.map.moveTo(sx(baseX + t[0]), sy(baseY + t[1]));
				}
				else {
					this.ctx.map.lineTo(sx(baseX + t[0]), sy(baseY + t[1]));
				}
			}, this);

			this.ctx.map.stroke();
			this.ctx.map.closePath();

			var pX = p.trace[p.trace.length - 1][0] + baseX - (0.5 * this.style.particleSize);
			var pY = p.trace[p.trace.length - 1][1] + baseY - (0.5 * this.style.particleSize);

			this.ctx.map.fillRect(pX, pY, this.style.particleSize, this.style.particleSize);

		}, this);
		
	}

	
};