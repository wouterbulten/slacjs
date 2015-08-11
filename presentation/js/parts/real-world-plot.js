var almende1Mean = [
2.41308081314,
0.785892028644,
1.98421621008,
3.33995622347,
0.952907979651,
5.87961761628,
0.600884539192,
3.54310306179];
var almende1Std = [
0.38449047919,
0.423239317409,
0.77422556952,
1.83547618824,
0.4131294606,
1.26721672537,
0.336797792753,
0.955978381951];

var almende8Mean = [
2.30551671477,
5.2608992731,
1.06515545182,
1.75535334635,
2.50362162553,
2.06238901832,
1.68194862383,
1.80924966445];
var almende8Std = [
0.175764611932,
0.80114556839,
0.661381032036,
0.406255425123,
0.355859545438,
0.410663388719,
0.399292941755,
0.397015659809];

var almende9Mean = [
3.0699454276,
3.49815265114,
2.6084093076,
3.42010377608,
1.88498424223,
4.01301842405,
3.53311991653,
2.55935400869];
var almende9Std = [
0.51849237456,
0.602688733142,
0.492796462759,
1.82941221361,
0.812717851842,
0.733570331592,
0.560106773806,
0.651036665802];

var labels = ['Average', 'Beacon 1', 'Beacon 2', 'Beacon 3', 'Beacon 4', 'Beacon 5', 'Beacon 6', 'Beacon 7'];

var realWorldData = {
	labels: labels,
	datasets: [
		{
			label: 'Real world #1',
			fillColor: 'rgba(201,48,119,0.3)',
			strokeColor: 'rgba(201,48,119,0.4)',
			pointColor: 'rgba(201,48,119,1.0)',
			pointStrokeColor: '#fff',
			pointHighlightFill: '#fff',
			pointHighlightStroke: 'rgba(220,220,220,1)',
			data: almende1Mean
		},
		{
			label: 'Real world #2',
			fillColor: 'rgba(26,167,190,0.3)',
			strokeColor: 'rgba(26,167,190,0.4)',
			pointColor: 'rgba(26,167,190,1.0)',
			pointStrokeColor: '#fff',
			pointHighlightFill: '#fff',
			pointHighlightStroke: 'rgba(220,220,220,1)',
			data: almende8Mean
		},
		{
			label: 'Real world #2',
			fillColor: 'rgba(55,14,156,0.3)',
			strokeColor: 'rgba(55,14,156,0.4)',
			pointColor: 'rgba(55,14,156,1.0)',
			pointStrokeColor: '#fff',
			pointHighlightFill: '#fff',
			pointHighlightStroke: 'rgba(220,220,220,1)',
			data: almende9Mean
		}
	]
};

Reveal.addEventListener('chart-real-world', function() {

	var ctx = $('#chart-real-world').get(0).getContext('2d');
	var rssiLine = new Chart(ctx).Bar(realWorldData, {
		scaleShowGridLines: true,
		scaleShowHorizontalLines: true,
		scaleShowVerticalLines: false,
		datasetStrokeWidth: 5,
		pointDotRadius: 6,
		scaleFontSize: 20,
		legendTemplate: "<% for (var i=0; i<datasets.length; i++){%><span style=\"color:<%=datasets[i].strokeColor%>\">&nbsp;&nbsp;&FilledSmallSquare;</span><%if(datasets[i].label){%><%=datasets[i].label%><%}%><%}%>"

	});

	$('#chart-real-world-legend').html(rssiLine.generateLegend());
});
