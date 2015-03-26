var User = function(x, y, xMax, yMax) {

	this.x = 0;
	this.y = 0;
	this.v = 5;
	this.r = 0.3;
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

	xn = Math.max(Math.min(this.x + Math.cos(this.r) * this.v + (2 * Math.random() - 1), this.xMax), 0);
	yn = Math.max(Math.min(this.y + Math.sin(this.r) * this.v + (2 * Math.random() - 1), this.yMax), 0);
	
	if(xn == 0 || xn == this.xMax) {
		this.r = Math.PI - this.r;
	}
	else if(yn == 0 || yn == this.yMax) {
		this.r = 2 * Math.PI - this.r;
	}
	
	this.moveToPosition(xn, yn)
};

User.prototype.reset = function() {
	console.debug('User@reset not implemented yet');
}


User.prototype.getControl = function() {

}