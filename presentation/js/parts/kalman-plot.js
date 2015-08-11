var rssi = [-63, -66, -64, -63, -63, -63, -66, -65, -67, -58, -62, -63, -62, -62, -64, -60, -63, -64, -64, -64, -63, -64, -70, -61, -62, -62, -63, -65, -62, -86, -75, -62, -66, -65, -61, -61, -60, -66, -60, -64];
var filtered = [-63, -64.5014985014985, -64.33377615189342, -63.99800498504884, -63.796019262584124, -63.66093175631507, -64.00370348525949, -64.13255543261918, -64.46542367905813, -63.78258520209969, -63.6093922577094, -63.55441719248509, -63.42318145127931, -63.309964352411306, -63.361995010642005, -63.12046231681456, -63.1121788014722, -63.170852875497914, -63.22370877116938, -63.27159916400582, -63.25533646023412, -63.298729396133346, -63.67966763744755, -63.53074428532079, -63.44740925294806, -63.37008072141169, -63.35064599921501, -63.43591197519457, -63.362737613573074, -64.50131241077843, -65.02307077102219, -64.87446800675337, -64.92924385513285, -64.93265595109995, -64.74459021179138, -64.56688256117405, -64.35166169326264, -64.42884683792019, -64.22267058287112, -64.21235986713583];

var filteredData = {
	labels: rssi.map(function(y, i) {
		return i;
	}),
	datasets: [
		{
			label: 'RSSI at 1m',
			fillColor: 'rgba(220,220,220,0.2)',
			strokeColor: 'rgba(0,0,0,0.3)',
			pointColor: 'rgba(0,0,0,0.5)',
			pointStrokeColor: '#fff',
			pointHighlightFill: '#fff',
			pointHighlightStroke: 'rgba(220,220,220,1)',
			data: rssi
		},
		{
			label: 'Filtered RSSI',
			fillColor: 'rgba(220,220,220,0)',
			strokeColor: '#A3BBBF',
			pointColor: '#1AA7BE',
			pointStrokeColor: '#fff',
			pointHighlightFill: '#fff',
			pointHighlightStroke: 'rgba(220,220,220,1)',
			data: filtered
		}
	]
};

Reveal.addEventListener('chart-kalman', function() {

	var ctx = $('#chart-kalman').get(0).getContext('2d');
	var kalmanLine = new Chart(ctx).Line(filteredData, {
		scaleShowGridLines: true,
		scaleShowHorizontalLines: true,
		scaleShowVerticalLines: false,
		datasetStrokeWidth: 5,
		pointDotRadius: 6,
		scaleFontSize: 20,
		legendTemplate: "<% for (var i=0; i<datasets.length; i++){%><span style=\"color:<%=datasets[i].strokeColor%>\">&nbsp;&nbsp;&FilledSmallSquare;</span><%if(datasets[i].label){%><%=datasets[i].label%><%}%><%}%>"
	});
	$('#chart-kalman-legend').html(kalmanLine.generateLegend());

});
