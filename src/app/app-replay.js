import config from './config';
import SlacController from './slac-controller';
import ReplayRenderer from './view/replay-renderer';
import { degreeToNormalisedHeading } from './util/motion';

/**
 * Application object for replaying recorded data
 * @type {Object}
 */
window.SlacApp = {

    bleEventIteration: 0,
    motionEventIteration: 0,

    controller: undefined,
    renderer: undefined,

    bleInterval: undefined,
    motionInterval: undefined,

    lastUpdate: 0,

    startMotionTimestamp: 0,
    currentMotionTimestamp: 0,

    startHeading: 0,

    distPlots: {},

    errorPlot: {},

    initialize() {

        if(typeof SlacJsData === 'undefined') {
            console.error('No replay data found');
        }

        if(typeof SlacJsLandmarkPositions === 'undefined') {
            console.error('No true landmark positions found');
        }

        if(typeof SlacJsStartingPosition === 'undefined') {
            console.error('No starting position found');
        }

        //Create a renderer for the canvas view
		this.renderer = new ReplayRenderer('slacjs-map', SlacJsLandmarkPositions);

        //Create a plot for the rssi data
        for(name in SlacJsLandmarkPositions) {
            if (SlacJsLandmarkPositions.hasOwnProperty(name)) {

                //this._createDistPlot(name);
            }
        }

        //Create plot for the errors
        this._initErrorPlot();
    },

    start() {

        //Store the current heading
        this.startHeading = SlacJsData.motion[0].heading;

        //Update the initial pose with the true starting position
        config.particles.user.defaultPose.x = SlacJsStartingPosition.x;
        config.particles.user.defaultPose.y = SlacJsStartingPosition.y;

        //Create a new controller
        this.controller = new SlacController(config);

        //We hack the controller to update the BLE observations before we run the internal update function
        this.controller.pedometer.onStep(() => {

            this._updateBleObservations(this.currentMotionTimestamp);
            this.controller._update();

            //Take the last observations and output the measurement error
            //for the best particle
            const user = this.controller.particleSet.userEstimate();

            //Show the current error
            this._calculateLandmarkError();
        });

        this.controller.start();

        //Bind renderer to controller
		this.controller.onUpdate((particles) => this.renderer.render(particles));

        //Save the start time, we use this to determine which BLE events to send
        this.lastUpdate = new Date().getTime();

        this.motionInterval = setInterval(() => this._processMotionObservation(), config.sensor.motion.frequency / 2);
    },

    /**
     * Utility function that returns the true distance to a beacon given a x,y position
     * @param  {Number} x         Location of user
     * @param  {Number} y         Location of user
     * @param  {String} name      Beacon name
     * @return {Number}           Distance
     */
    distanceToBeacon(x, y, name) {

        const beacon = SlacJsLandmarkPositions[name];

        const dx = x - beacon.x;
        const dy = y - beacon.y;

        return Math.sqrt((dx * dx) + (dy * dy));
    },

    /**
     * Simulate a motion event
     * @return {void}
     */
    _processMotionObservation() {

        if(this.motionEventIteration >= SlacJsData.motion.length) {
            clearInterval(this.motionInterval);

            console.log('[SLACjs] Motion events finished');
            return;
        }

        const data = SlacJsData.motion[this.motionEventIteration];

        if(this.startMotionTimestamp === 0) {
            this.startMotionTimestamp = data.timestamp;
        }

        this.controller.addMotionObservation(
            data.x, data.y, data.z,
            degreeToNormalisedHeading(data.heading, this.startHeading)
        );

        this.currentMotionTimestamp = data.timestamp;
        this.motionEventIteration++;
    },

    /**
     * Process all BLE observations until timestamp
     * @param  {Number} timestamp
     * @return {void}
     */
    _updateBleObservations(timestamp) {

        let current;

        do {
            current = SlacJsData.bluetooth[this.bleEventIteration];

            this.bleEventIteration++;

            this.controller.addDeviceObservation(current.address, current.rssi, current.name);
        }
        while(current.timestamp <= timestamp);
    },

    _calculateLandmarkError() {

        const distArr = [];
        let landmarkErrorsStr = '';

        this.controller.particleSet.bestParticle().landmarks.forEach(function(l) {

        	const trueL = SlacJsLandmarkPositions[l.name];

        	const dist = Math.sqrt(Math.pow(trueL.x - l.x, 2) + Math.pow(trueL.y - l.y, 2));

        	distArr.push(dist);

            landmarkErrorsStr += l.name + ': ' + dist + '<br>';
        });

        if(distArr.length > 0) {
            $('.landmark-individual-error').html(landmarkErrorsStr);

            const avg = distArr.reduce(function(total, d) { return total + d; }, 0) / distArr.length;
            this.errorPlot.data.push(avg);

            this.errorPlot.plot.series[0].setData(this.errorPlot.data);
            $('.landmark-error').html(avg);
        }
    },

    _initErrorPlot() {

        this.errorPlot = {

            data: [],

            plot: new Highcharts.Chart({
                chart: {
                    renderTo: 'error-plot',
                },
                title: {
                    text: 'Error plot',
                },
                xAxis: {
                    title: {
                        text: 'Time'
                    }
                },
                yAxis: [
                    {
                        title: {
                            text: 'Error'
                        },
                        max: 4,
                        min: 1
                    }
                ],
                series: [
                    {
                        name: 'Error',
                        type: 'line',
                    }
                ]
            })
        }
    }
};
