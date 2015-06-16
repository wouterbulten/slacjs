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

    initialize() {

        if(SlacJsData === undefined) {
            console.error('No replay data found');
        }

        if(SlacJsLandmarkPositions === undefined) {
            console.error('No true landmark positions found');
        }

        if(SlacJsStartingPosition === undefined) {
            console.error('No starting position found');
        }

        //Create a renderer for the canvas view
		this.renderer = new ReplayRenderer('slacjs-map', SlacJsLandmarkPositions);

        //Create a plot for the rssi data
        for(name in SlacJsLandmarkPositions) {
            if (SlacJsLandmarkPositions.hasOwnProperty(name)) {

                this._createDistPlot(name);
            }
        }
    },

    start() {

        //Store the current heading
        this.startHeading = SlacJsData.motion[0].heading;

        //Update the initial pose with the true starting position
        const startingPose = config.particles.defaultPose;
        startingPose.x = SlacJsStartingPosition.x;
        startingPose.y = SlacJsStartingPosition.y;

        //Create a new controller
        this.controller = new SlacController(
            config.particles.N,
            startingPose,
            config.beacons,
            config.sensor.frequency,
            config.pedometer.stepSize
        );

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
        });

        this.controller.start();

        //Bind renderer to controller
		this.controller.onUpdate((particles) => this.renderer.render(particles));

        //Save the start time, we use this to determine which BLE events to send
        this.lastUpdate = new Date().getTime();

        this.motionInterval = setInterval(() => this._processMotionObservation(), config.sensor.frequency / 10);
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

            this.controller.addDeviceObservation(current.address, current.rssi, current.name);
            this.bleEventIteration++;

            this._updateRssiPlot(current.name, current.rssi)
        }
        while(current.timestamp <= timestamp);
    },

    _createDistPlot(name) {
        $('#dist-plots').append(`<div id="${name}-dist"></div>`);

        this.distPlots[name] = {

            data: {
                real: [],
                measured: [],
                rssi: [],
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
                            text: 'Distance'
                        },
                    },
                    {
                        title: {
                            text: 'RSSI'
                        },
                        opposite: true
                    }
                ],
                series: [
                    {
                        name: 'Computed distance from average user (averaged over all particles) to real beacon location',
                        type: 'line',
                        yAxis: 0
                    },
                    {
                        name: 'Measured distance to beacon using path loss model',
                        type: 'line',
                        yAxis: 0
                    },
                    {
                        name: 'RSSI',
                        type: 'line',
                        yAxis: 1
                    }
                ]
            })
        }
    },

    _updateRssiPlot(name, rssi) {

        //Filter invalid values
        if(rssi > 0) {
            rssi = null;
        }

        const plot = this.distPlots[name];
        plot.data.rssi.push([plot.data.index, rssi]);
        plot.data.index++;

        plot.plot.series[2].setData(plot.data.rssi);
    },

    _updateDistPlot(name, real, measured) {

        const plot = this.distPlots[name];

        plot.data.real.push([plot.data.index, real]);
        plot.data.measured.push([plot.data.index, measured]);

        plot.plot.series[0].setData(plot.data.real);
        plot.plot.series[1].setData(plot.data.measured);
    }
};
