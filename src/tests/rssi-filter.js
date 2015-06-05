import Landmark from '../app/simulation/landmark';
import config from '../app/config';
import KalmanFilter from '../app/util/kalman';
import { variance } from '../app/util/math';

if (window.test === undefined) {
	window.test = {};
}

window.test.rssiFilter = {

	landmark: undefined,
	kalman: undefined,

	userX: 5,
	userY: 0,

	rssiTrue: [],
	rssiRaw: [],
	rssiFiltered: [],
	error: [],
	realError: [],

	iteration: 0,

	initialize: function() {

		this.landmark = new Landmark('uid', {x: 0, y: 0}, config.beacons);
		this.kalman = new KalmanFilter({
			Q: config.beacons.noise,
			R: 0.008
		});
	},

	iterate: function() {

		if(this.iteration % 100 === 0) {
			this.userX += 5;
			//this.kalman.R = 1;
		}

		const rssi = this.landmark.rssiAt(this.userX, this.userY);
		const rssiTrue = this.landmark.rssiAtRaw(this.userX, this.userY);
		const rssiFiltered = this.kalman.filter(rssi);

		this.rssiTrue.push([this.iteration, rssiTrue]);
		this.rssiRaw.push([this.iteration, rssi]);
		this.rssiFiltered.push([this.iteraton, rssiFiltered]);

		this.error.push(Math.abs(rssiTrue - rssiFiltered));
		this.realError.push(Math.abs(rssiTrue - rssi));

		this.iteration++;
	},

	plot: function() {
		$('#test-content').highcharts({
			chart: {
				type: 'scatter'
			},	
			title: {
				text: 'RSSI'
			},
			xAxis: {
				title: {
					text: 'Time'
				}
			},
			yAxis: {
				title: {
					text: 'RSSI'
				}
			},
			series: [
				{
					name: 'True RSSI',
					data: this.rssiTrue
				},
				{
					name: 'Raw RSSI',
					data: this.rssiRaw
				},

				{
					name: 'Filtered RSSI',
					type: 'line',
					data: this.rssiFiltered
				}
			]
		});

		$('#test-error').html(this.error.reduce((p, c, i) => p+(c-p)/(i+1), 0));
		$('#test-error-var').html(variance(this.error, (e) => e));
		$('#test-error-real').html(this.realError.reduce((p, c, i) => p+(c-p)/(i+1), 0));
		$('#test-error-real-var').html(variance(this.realError, (e) => e));
	}
};