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

	dpi: 1,

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

	update: function(user, landmarks, particles, bestParticle) {

		//Clear any remaining drawings
		this.ctx.map.clearRect(0, 0, this.canvas.map.width, this.canvas.map.height);

		this.plotLandmarks(landmarks);
		this.plotUserTrace(user);
		this.plotParticles(user, particles);
		this.plotLandmarkPredictions(user,bestParticle, landmarks);
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
		
	},

	plotLandmarkPredictions: function(user, particle, landmarks) {

		this.ctx.map.lineWidth = this.style.particleTraceWidth;
		this.ctx.map.fillStyle = '#10870C';
		this.ctx.map.strokeStyle = '#C7C7C7';
		
		for(lId in particle.landmarks)
		{
			if(particle.landmarks.hasOwnProperty(lId)) {
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
	drawEllipseWithBezierByCenter: function(ctx, cx, cy, w, h) {
        this.drawEllipseWithBezier(ctx, cx - w/2.0, cy - h/2.0, w, h);
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
	drawEllipseWithBezier: function(ctx, x, y, w, h) {
        var kappa = .5522848,
            ox = (w / 2) * kappa, // control point offset horizontal
            oy = (h / 2) * kappa, // control point offset vertical
            xe = x + w,           // x-end
            ye = y + h,           // y-end
            xm = x + w / 2,       // x-middle
            ym = y + h / 2;       // y-middle

        ctx.beginPath();
        ctx.moveTo(x, ym);
        ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
        ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
        ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
        ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
        ctx.stroke();
      }
};


