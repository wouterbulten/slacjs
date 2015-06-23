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

            this.controller.lastObservations.forEach((obs) => {
                const trueDist = this.distanceToBeacon(user.x, user.y, obs.name);

                this._updateDistPlot(obs.name, trueDist, obs.r);
            });

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

            /*if(current.name != 'LowBeacon5_2015-06-16') {
                console.log(current.name);
                continue;
            }*/
            this.controller.addDeviceObservation(current.address, current.rssi, current.name);

            if(current.rssi < 0) {
                const filteredRssi = this.controller.sensor.landmarks.get(current.address).filter.lastMeasurement();

                this._updateRssiPlot(current.name, current.rssi, filteredRssi);
            }
        }
        while(current.timestamp <= timestamp);
    },

    _createDistPlot(name) {

        return;
        $('#dist-plots').append(`<div id="${name}-dist"></div>`);

        this.distPlots[name] = {

            data: {
                real: [],
                measured: [],
                rssi: [],
                rawDist: [],
                kalman: [],
                index: 0
            },

            plot: new Highcharts.Chart({
                chart: {
                    renderTo: `${name}-dist`,
                },
                title: {
                    text: `${name}`,
                },
                xAxis: {
                    title: {
                        text: 'Time'
                    }
                },
                yAxis: [
                    {
                        title: {
                            text: 'RSSI'
                        },
                        opposite: true,
                        max: -50,
                        min: -100
                    },
                    {
                        title: {
                            text: 'Distance'
                        },
                        min: 0,
                        max: 10,
                    }
                ],
                series: [
                    {
                        name: 'Computed distance from average user (averaged over all particles) to real beacon location',
                        type: 'line',
                        yAxis: 1
                    },
                    {
                        name: 'Measured distance to beacon using path loss model',
                        type: 'line',
                        yAxis: 1
                    },
                    {
                        name: 'RSSI',
                        type: 'line',
                        yAxis: 0
                    },
                    {
                        name: 'Raw distance',
                        type: 'line',
                        yAxis: 1
                    },
                    {
                        name: 'RSSI kalman',
                        type: 'line',
                        yAxis: 0
                    }
                ]
            })
        }
    },

    _updateRssiPlot(name, rssi, filteredRssi) {
        return;
        //Filter invalid values
        let dist;
        if (rssi > 0) {
            rssi = null;
            dist = null;
        }
        else {
            dist = Math.pow(10, (rssi - config.landmarkConfig.txPower) / (-10 * config.landmarkConfig.n));
        }


        const plot = this.distPlots[name];
        plot.data.rssi.push([plot.data.index, rssi]);
        plot.data.rawDist.push([plot.data.index, dist]);
        plot.data.kalman.push([plot.data.index, filteredRssi]);
        plot.data.index++;

        plot.plot.series[2].setData(plot.data.rssi);
        plot.plot.series[3].setData(plot.data.rawDist);
        plot.plot.series[4].setData(plot.data.kalman);
    },

    _updateDistPlot(name, real, measured) {
        return;
        const plot = this.distPlots[name];

        plot.data.real.push([plot.data.index, real]);
        plot.data.measured.push([plot.data.index, measured]);

        plot.plot.series[0].setData(plot.data.real);
        plot.plot.series[1].setData(plot.data.measured);
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
