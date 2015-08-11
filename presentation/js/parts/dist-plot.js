var dist30 = Y30.map(function(rssi) {
	return Math.pow(10, (rssi + 62) / (-10 * 2));
});
var dist60 = Y60.map(function(rssi) {
	return Math.pow(10, (rssi + 62) / (-10 * 2));
});
var dist100 = Y100.map(function(rssi) {
	return Math.pow(10, (rssi + 62) / (-10 * 2));
});
var dist300 = Y300.map(function(rssi) {
	return Math.pow(10, (rssi + 62) / (-10 * 2));
});
var distroom = Yroom.map(function(rssi) {
	return Math.pow(10, (rssi + 62) / (-10 * 2));
});

var distData = {
	labels: dist30.map(function(y, i) {
		return i;
	}),
	datasets: [
		{
			label: '30cm',
			fillColor: 'rgba(220,220,220,0)',
			strokeColor: 'rgba(201,48,119,0.4)',
			pointColor: 'rgba(201,48,119,1.0)',
			pointStrokeColor: '#fff',
			pointHighlightFill: '#fff',
			pointHighlightStroke: 'rgba(220,220,220,1)',
			data: dist30
		},
		{
			label: '60cm',
			fillColor: 'rgba(220,220,220,0)',
			strokeColor: 'rgba(233,209,9,0.4)',
			pointColor: 'rgba(233,209,9,1.0)',
			pointStrokeColor: '#fff',
			pointHighlightFill: '#fff',
			pointHighlightStroke: 'rgba(220,220,220,1)',
			data: dist60
		}
	]
};
var distDataSpike = {
	labels: dist30.map(function(y, i) {
		return i;
	}),
	datasets: [
		{
			label: '1m',
			fillColor: 'rgba(220,220,220,0)',
			strokeColor: 'rgba(26,167,190,0.4)',
			pointColor: 'rgba(26,167,190,1.0)',
			pointStrokeColor: '#fff',
			pointHighlightFill: '#fff',
			pointHighlightStroke: 'rgba(220,220,220,1)',
			data: dist100
		},
		{
			label: '3m',
			fillColor: 'rgba(220,220,220,0)',
			strokeColor: 'rgba(0,237,27,0.4)',
			pointColor: 'rgba(0,237,27,1)',
			pointStrokeColor: '#fff',
			pointHighlightFill: '#fff',
			pointHighlightStroke: 'rgba(220,220,220,1)',
			data: dist300
		},
		{
			label: 'Different room',
			fillColor: 'rgba(220,220,220,0)',
			strokeColor: 'rgba(55,14,156,0.4)',
			pointColor: 'rgba(55,14,156,1)',
			pointStrokeColor: '#fff',
			pointHighlightFill: '#fff',
			pointHighlightStroke: 'rgba(220,220,220,1)',
			data: distroom
		}
	]
};

Reveal.addEventListener('chart-dist', function() {

	var ctx = $('#chart-dist-spike').get(0).getContext('2d');
	var distLine = new Chart(ctx).Line(distDataSpike, {
		scaleShowGridLines: true,
		scaleShowHorizontalLines: true,
		scaleShowVerticalLines: false,
		datasetStrokeWidth: 5,
		pointDotRadius: 6,
		legendTemplate: "<% for (var i=0; i<datasets.length; i++){%><span style=\"color:<%=datasets[i].strokeColor%>\">&nbsp;&nbsp;&FilledSmallSquare;</span><%if(datasets[i].label){%><%=datasets[i].label%><%}%><%}%>"

	});

	$('#chart-dist-spike-legend').html(distLine.generateLegend());
});
