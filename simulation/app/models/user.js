var User = function(x, y, xMax, yMax) {

	//Current position
	this.x = 0;
	this.y = 0;
	this.r = MathAdapter.randn(0,1) * 2 * Math.PI;

	//Current velocity
	this.v = 5;

	//Latest control, without noise
	this.dx = 0;
	this.dy = 0;
	this.dr = 0;


	this.xMax = xMax;
	this.yMax = yMax;
	this.trace = [[x,y]];
};

User.prototype.moveToPosition = function(xn, yn) {

	this.trace.push([xn, yn]);
	this.x = xn;
	this.y = yn;
};

User.prototype.step = function() {

	this.dx = Math.cos(this.r) * this.v;
	this.dy = Math.sin(this.r) * this.v;

	xn = Math.max(Math.min(this.x + this.dx + MathAdapter.randn(0,2), this.xMax), 0);
	yn = Math.max(Math.min(this.y + this.dy + MathAdapter.randn(0,2), this.yMax), 0);
	
	if(xn == 0 || xn == this.xMax) {
		this.dr = Math.PI - this.r;
	}
	else if(yn == 0 || yn == this.yMax) {
		this.dr = 2 * Math.PI - this.r;
	}
	this.r = this.dr //+ MathAdapter.randn(0,1);
	
	this.moveToPosition(xn, yn)
};

User.prototype.getControl = function() {
	return [this.dx, this.dy, this.dr];
}