var steps = 10;
var nParticles = 10;
var moveSd = 40;

var elements = [];
var ctxs = [];

var userSize = 10;
var userTrace = [
    [100, 0],
    [200, 0],
    [200, 0],
    [700, 0],
    [700, 300],
    [700, 500],
];

var particles = [];

function randn(mean, sd) {

	//Retrieved from jStat
	var u;
	var v;
	var x;
	var y;
	var q;

	do {
		u = Math.random();
		v = 1.7156 * (Math.random() - 0.5);
		x = u - 0.449871;
		y = Math.abs(v) + 0.386595;
		q = x * x + y * (0.19600 * y - 0.25472 * x);
	} while (q > 0.27597 && (q > 0.27846 || v * v > -4 * Math.log(u) * u * u));

	return (v / u) * sd + mean;
}

//Create particles
userTrace.forEach(function(t, i) {

    var current = [[t[0], t[1]]];

    for (var p = 1; p < nParticles; p++) {

        current.push([
            randn(current[p - 1][0], moveSd),
            randn(current[p - 1][1], moveSd)
        ]);
    }

    particles.push(current);
});

for(var i = 0; i < steps; i++) {

    var el = $('#slac-canvas-' + i);
    elements.push(el);

    ctxs.push(el[0].getContext('2d'));
}

function drawEllipseWithBezierByCenter(ctx, cx, cy, w, h) {
    drawEllipseWithBezier(ctx, cx - w/2.0, cy - h/2.0, w, h);
}

function drawEllipseWithBezier(ctx, x, y, w, h) {
    var kappa = .5522848,
    ox = (w / 2) * kappa, // control point offset horizontal
    oy = (h / 2) * kappa, // control point offset vertical
    xe = x + w,           // x-end
    ye = y + h,           // y-end
    xm = x + w / 2,       // x-middle
    ym = y + h / 2;       // y-middle

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, ym);
    ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
    ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
    ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
    ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);

    ctx.strokeStyle= '#999999';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
}

function drawUser(ctx, trace, plotLastPoint) {

    if(typeof plotLastPoint == 'undefined') {
        plotLastPoint = true;
    }

    ctx.lineJoin = 'round';
    ctx.lineWidth = 3;
    ctx.fillStyle = '#960E0E';
    ctx.strokeStyle = 'red';

    ctx.beginPath();

    trace.forEach(function(t, i) {
        if (i === 0) {
			ctx.moveTo(t[0], t[1]);
		}
		else {
			ctx.lineTo(t[0], t[1]);
		}
    });
    ctx.stroke();
    ctx.closePath();

    //Plot current user position
    if(plotLastPoint)
    {
        var user = new Path2D();
        var last = trace[trace.length - 1];
        user.arc(last[0], last[1], userSize, 0, 2 * Math.PI);
        ctx.fill(user);
    }
}

function drawParticle(ctx, trace, plotLastPoint) {

    if(typeof plotLastPoint == 'undefined') {
        plotLastPoint = true;
    }

    ctx.lineJoin = 'round';
    ctx.lineWidth = 3;
    ctx.fillStyle = '#000000';
    ctx.strokeStyle = '#636363';

    ctx.beginPath();

    trace.forEach(function(t, i) {
        if (i === 0) {
			ctx.moveTo(t[0], t[1]);
		}
		else {
			ctx.lineTo(t[0], t[1]);
		}
    });
    ctx.stroke();
    ctx.closePath();

    //Plot current user position
    if(plotLastPoint)
    {
        var user = new Path2D();
        var last = trace[trace.length - 1];
        user.arc(last[0], last[1], userSize / 2, 0, 2 * Math.PI);
        ctx.fill(user);
    }
}

function drawPrediction(ctx, x, y, sd) {

    var pred = new Path2D();

}
// ctxs.forEach(function(ctx, i) {
//
//     drawUser(ctx, userTrace.slice(0, i + 1));
//
//     particles.forEach(function(p) {
//         drawParticle(ctx, p.slice(0, i + 1));
//     });
//
// })
//

//Draw all frames

drawUser(ctxs[0], [[100, 100]]);

drawUser(ctxs[1], [[100, 100], [300, 100]]);

drawUser(ctxs[2], [[100, 100], [300, 100]], false);
drawEllipseWithBezierByCenter(ctxs[2], 300, 100, 150, 190);

drawUser(ctxs[3], [[100 ,100], [300, 100]], false);
drawEllipseWithBezierByCenter(ctxs[3], 300, 100, 150, 190);
drawParticle(ctxs[3], [[100, 100], [310, 110]]);
drawParticle(ctxs[3], [[100, 100], [240, 80]]);
drawParticle(ctxs[3], [[100, 100], [340, 150]]);
drawParticle(ctxs[3], [[100, 100], [320, 50]]);

drawUser(ctxs[4], [[100, 100], [300, 100], [500, 100]], true);
drawEllipseWithBezierByCenter(ctxs[4], 510, 110, 150, 190);
drawEllipseWithBezierByCenter(ctxs[4], 540, 80, 150, 190);
drawEllipseWithBezierByCenter(ctxs[4], 540, 150, 150, 190);
drawEllipseWithBezierByCenter(ctxs[4], 520, 50, 150, 190);
drawParticle(ctxs[4], [[100, 100], [310, 110], [500, 140]]);
drawParticle(ctxs[4], [[100, 100], [240, 80], [560, 60]]);
drawParticle(ctxs[4], [[100, 100], [340, 150], [520, 180]]);
drawParticle(ctxs[4], [[100, 100], [320, 50], [450, 30]]);

drawUser(ctxs[5], [[100, 100], [300, 100], [500, 100]], true);
drawParticle(ctxs[5], [[100, 100], [310, 110], [500, 140]]);
drawParticle(ctxs[5], [[100, 100], [240, 80], [560, 60]]);
drawParticle(ctxs[5], [[100, 100], [340, 150], [520, 180]]);
drawParticle(ctxs[5], [[100, 100], [320, 50], [450, 30]]);
