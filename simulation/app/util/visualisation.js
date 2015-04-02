var visualisation = {

	canvas: undefined,
	ctx: undefined,

	userPath: undefined,
	landmarks: [],


	init: function(canvasElement, xMax, yMax) {

		var canvas = $(canvasElement);
		var padding = 20;

		this.canvas = canvas;
		this.ctx = canvas[0].getContext('2d');

		//Clear any remaining drawings
		this.ctx.clearRect(0, 0, canvas.width(), canvas.height());

		self.sx = function(x) {
			return x*((canvas.width() - (2 * padding))/xMax) + padding;
		}
		self.sy = function(y) {
			return (yMax - y) *((canvas.height() - (2 * padding))/yMax) + padding
		}
	},

	update: function(user, landmarks, particles) {

		//Clear any remaining drawings
		this.ctx.clearRect(0, 0, this.canvas.width(), this.canvas.height());

		this.plotLandmarks(landmarks);
		this.plotUserTrace(user);
		this.plotParticles(user, particles);
	},

	plotLandmarks: function(landmarks) {

		this.ctx.fillStyle = '#000000';

		landmarks.forEach(function(l) {

			this.ctx.fillRect(sx(l.x) - 3, sy(l.y) - 3, 6, 6);

		}, this);
	},

	plotUserTrace: function(user) {

		this.ctx.lineJoin = 'round';
		this.ctx.lineWidth = 2;
		this.ctx.strokeStyle = '#1B61D1';
		this.ctx.beginPath();

		user.trace.forEach(function(t, i) {
			if(i == 0) {
				this.ctx.moveTo(sx(t[0]), sy(t[1]));
			}
			else {
				this.ctx.lineTo(sx(t[0]), sy(t[1]));
			}
		}, this);

		this.ctx.stroke();
		this.ctx.closePath();
	},

	plotParticles: function(user, particles) {

		this.ctx.lineJoin = 'round';
		this.ctx.lineWidth = 1;
		this.ctx.fillStyle = '#960E0E';
		this.ctx.strokeStyle = '#C7C7C7';
		
		//Particles always start at 0,0 but the user can start somewhere else in the global frame
		var baseX = user.trace[0][0]
		var baseY = user.trace[0][1]

		//Plot the traces & particles
		particles.forEach(function(p) {
			
			this.ctx.beginPath();

			p.trace.forEach(function(t, i) {
				if(i == 0) {
					this.ctx.moveTo(sx(baseX + t[0]), sy(baseY + t[1]));
				}
				else {
					this.ctx.lineTo(sx(baseX + t[0]), sy(baseY + t[1]));
				}
			}, this);

			this.ctx.stroke();
			this.ctx.closePath();

			var pX = p.trace[p.trace.length - 1][0] + baseX;
			var pY = p.trace[p.trace.length - 1][1] + baseY;

			this.ctx.fillRect(sx(pX) - 1, sy(pY) - 1, 2, 2);

		}, this);
		
	}

	
};