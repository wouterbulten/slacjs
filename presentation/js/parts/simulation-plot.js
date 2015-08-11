var fixedMovementMean = [
0.258668256945,
0.218830282752,
0.241024054511,
0.195981458106,
0.25050673399,
0.464192131721,
0.302389843327,
0.137753294207];
var fixedMovementStd = [
0.0700229136313,
0.155138276471,
0.191002805386,
0.144097178842,
0.156639326285,
0.304397628901,
0.186544722831,
0.0455949336542];

var noisyMovementMean = [
0.560939480783,
0.52724633758,
0.576869337417,
0.531001823884,
0.554597106781,
0.677262901966,
0.552020470393,
0.507578387462];
var noisyMovementStd = [
0.205425371901,
0.27931625432,
0.312744449471,
0.261441038177,
0.295196823329,
0.385675124095,
0.315258183097,
0.26934916934];

var labels = ['Average', 'Beacon 1', 'Beacon 2', 'Beacon 3', 'Beacon 4', 'Beacon 5', 'Beacon 6', 'Beacon 7'];

var simData1 = {
	labels: labels,
	datasets: [
		{
			label: 'Perfect world simulation',
			fillColor: 'rgba(201,48,119,0.3)',
			strokeColor: 'rgba(201,48,119,0.4)',
			pointColor: 'rgba(201,48,119,1.0)',
			pointStrokeColor: '#fff',
			pointHighlightFill: '#fff',
			pointHighlightStroke: 'rgba(220,220,220,1)',
			data: fixedMovementMean
		},
		{
			label: 'Simulation with noisy movement',
			fillColor: 'rgba(55,14,156,0.3)',
			strokeColor: 'rgba(55,14,156,0.4)',
			pointColor: 'rgba(55,14,156,1.0)',
			pointStrokeColor: '#fff',
			pointHighlightFill: '#fff',
			pointHighlightStroke: 'rgba(220,220,220,1)',
			data: noisyMovementMean
		}
	]
};

Reveal.addEventListener('chart-sim-1', function() {

	var ctx = $('#chart-sim-1').get(0).getContext('2d');
	var rssiLine = new Chart(ctx).Bar(simData1, {
		scaleShowGridLines: true,
		scaleShowHorizontalLines: true,
		scaleShowVerticalLines: false,
		datasetStrokeWidth: 5,
		pointDotRadius: 6,
		scaleFontSize: 20,
		legendTemplate: "<% for (var i=0; i<datasets.length; i++){%><span style=\"color:<%=datasets[i].strokeColor%>\">&nbsp;&nbsp;&FilledSmallSquare;</span><%if(datasets[i].label){%><%=datasets[i].label%><%}%><%}%>"

	});

	$('#chart-sim-1-legend').html(rssiLine.generateLegend());
});
