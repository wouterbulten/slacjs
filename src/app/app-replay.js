import config from './config';
import SlacController from './slac-controller';
import ReplayRenderer from './view/replay-renderer';
import { degreeToRadian, clockwiseToCounterClockwise } from './util/motion';

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

    initialize() {

        if(SlacJsData === undefined) {
            console.error('No replay data found');
        }

        if(SlacJsLandmarkPositions === undefined) {
            console.error('No true landmark positions found');
        }

        //Create a renderer for the canvas view
		this.renderer = new ReplayRenderer('slacjs-map', SlacJsLandmarkPositions);
    },

    start() {

        //Use the current heading as the base
		const startingPose = config.particles.defaultPose;
		startingPose.theta = degreeToRadian(clockwiseToCounterClockwise(SlacJsData.motion[0].heading));

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
        });

        this.controller.start();

        //Bind renderer to controller
		this.controller.onUpdate((particles) => this.renderer.render(particles));

        //Save the start time, we use this to determine which BLE events to send
        this.lastUpdate = new Date().getTime();

        this.motionInterval = setInterval(() => this._processMotionObservation(), config.sensor.frequency);
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
            degreeToRadian(clockwiseToCounterClockwise(data.heading))
        );

        this.currentMotionTimestamp = data.timestamp;
        this.motionEventIteration++;
    },

    /**
     * Simulate a BLE event
     * @return {void}
     */
    _processBleObservation() {

        if(this.bleEventIteration >= SlacJsData.bluetooth.length) {
            clearInterval(this.bleInterval);

            console.log('[SLACjs] BLE events finished');
            return;
        }

        const data = SlacJsData.bluetooth[this.bleEventIteration];

        this.controller.addDeviceObservation(data.address, data.rssi, data.name);

        this.bleEventIteration++;
    },

    _updateBleObservations(timestamp) {

        let current;

        do {
            current = SlacJsData.bluetooth[this.bleEventIteration];
            this.controller.addDeviceObservation(current.address, current.rssi, current.name);
            this.bleEventIteration++;
        }
        while(current.timestamp <= timestamp);
    }
};
