import SlacController from './slac-controller';
import BLE from './device/bluetooth.js';
import MotionSensor from './device/motion-sensor';
import ParticleRenderer from './view/particle-renderer';
import ReplayRenderer from './view/replay-renderer';
import DataStore from './device/data-storage';
import { degreeToRadian, degreeToNormalisedHeading } from './util/motion';
import config from './config';

window.SlacApp = {

	controller: undefined,

	motionSensor: undefined,
	ble: undefined,
	renderer: undefined,
	storage: undefined,

	uiElements: {},

	observations: {
		bluetooth: [],
		motion: []
	},

	startHeading: 0,

	/**
	 * Setup the application
	 * @return {void}
	 */
	initialize() {

		console.log('[SLACjs] Running initialization');

		//Cache all UI elements
		this.uiElements = {
			indx: $('.motion-indicator-x'),
			indy: $('.motion-indicator-y'),
			indz: $('.motion-indicator-z'),
			indheading: $('.motion-indicator-heading'),
			stepCount: $('.motion-step-count'),
			map: $('#slacjs-map'),

			deviceMotionEnabled: $('.device-motion'),
			deviceCompassEnabled: $('.device-compass'),
			deviceBleEnabled: $('.device-ble'),

			btnStart: $('.btn-start'),
			btnReset: $('.btn-reset'),
			btnPause: $('.btn-pause'),
			btnExport: $('.btn-export')
		};

		//Lock the orientation of the device
		this._lockDeviceOrientation();

		//Create a new motion sensor object that listens for updates
		//The sensor is working even if the algorithm is paused (to update the view)
		this._startMotionSensing();

		//Start the bluetooth radio
		this._startBluetooth();

		//Bind events to the buttons
		this._bindButtons();

		//Create a renderer for the canvas view
		this.renderer = new ReplayRenderer('slacjs-map', {});

		//Create a datastore object to save the trace
		this.storage = new DataStore();
	},

	/**
	 * Start the SLACjs algorithm
	 * @return {void}
	 */
	start() {

		console.log('[SLACjs] Starting');

		if(this.controller !== undefined) {
			this.reset();
		}

		this.uiElements.btnStart.prop('disabled', true);

		//Go in background mode if it is enabled
		if(config.backgroundMode) {
			/*
			global cordova
			 */
			cordova.plugins.backgroundMode.setDefaults({ title: 'SLACjs running', text:'Background monitoring'});
			cordova.plugins.backgroundMode.enable();
		}

		//Use the current heading as the base
		config.particles.user.defaultPose.theta = degreeToRadian(this.motionSensor.heading);
		this.startHeading = this.motionSensor.heading;

		//Create a new controller
		this.controller = new SlacController(config);

		//Bind renderer to controller
		this.controller.onUpdate((particles) => this.renderer.render(particles));

		console.log('[SLACjs] Controller created');

		this.controller.start();

		console.log('[SLACjs] Controller started');

		this.uiElements.btnReset.prop('disabled', false);
		this.uiElements.btnExport.prop('disabled', false);

		console.log('[SLACjs] Start listening for devices');

		this.ble.startListening();
	},

	/**
	 * Reset the SLACjs controller
	 * @return {void}
	 */
	reset() {

		console.log('[SLACjs] Resetting controller');

		this.uiElements.btnStart.prop('disabled', false);
		this.uiElements.btnReset.prop('disabled', true);
		this.uiElements.btnExport.prop('disabled', true);

		this.ble.stopListening();
		delete this.controller;

		if(config.backgroundMode) {
			/*
			global cordova
			 */
			cordova.plugins.backgroundMode.disable();
		}
	},

	/**
	 * Pause the SLACjs controller
	 * @return {void}
	 */
	pause() {
		console.log('[SLACjs] Pausing controller');

		this.controller.pause();
	},

	/**
	 * Save data to the storage
	 * @return {void}
	 */
	export() {
		this.storage.save(this.observations);
	},

	/**
	 * Bind events to buttons in the view
	 * @return {void}
	 */
	_bindButtons() {

		this.uiElements.btnStart.on('click', () => this.start());
		this.uiElements.btnReset.on('click', () => this.reset());
		this.uiElements.btnPause.on('click', () => this.pause());
		this.uiElements.btnExport.on('click', () => this.export());
	},

	/**
	 * Start the bluetooth radio
	 * @return {void}
	 */
	_startBluetooth() {

		this.ble = new BLE(config.ble.frequency);

		this.ble.filter((obs) => {
			return obs.name !== undefined && obs.name !== null && ~obs.name.indexOf(config.ble.devicePrefix);
		});

		const success = this.ble.initRadio();

		if (success) {
			this.uiElements.deviceBleEnabled.addClass('enabled');
		}
		else {
			console.log('[SLACjs] BLE Radio not enabled');
		}

		this.ble.onObservation((data) => this._bluetoothObservation(data));
	},

	/**
	 * Start the motion sensing
	 * @return {void}
	 */
	_startMotionSensing() {

		//Create a new motion sensor object that listens for updates
		//@todo Move booleans to config
		this.motionSensor = new MotionSensor(config.sensor.motion.frequency);

		//Register a listener, this udpates the view and runs the pedometer
		this.motionSensor.onChange((data) => this._motionUpdate(data));
		const enabled = this.motionSensor.startListening();

		//Update the view to indicate all sensors are working
		if (enabled.accelerometer) {
			this.uiElements.deviceMotionEnabled.addClass('enabled');
		}

		if (enabled.compass) {
			this.uiElements.deviceCompassEnabled.addClass('enabled');
		}
	},

	/**
	 * Process a motion update event
	 * @param  {Object} data
	 * @return {void}
	 */
	_motionUpdate(data) {

		//Update the view
		this.uiElements.indx.html(data.x.toFixed(2));
		this.uiElements.indy.html(data.y.toFixed(2));
		this.uiElements.indz.html(data.z.toFixed(2));
		this.uiElements.indheading.html(data.heading.toFixed(2));

		//Send the motion update to the controller
		if (this.controller !== undefined) {

			if(config.exportData) {
				data.timestamp = new Date().getTime();

				this.observations.motion.push(data);
			}

			this.controller.addMotionObservation(
				data.x, data.y, data.z,
				degreeToNormalisedHeading(data.heading, this.startHeading)
			);

			this.uiElements.stepCount.html(this.controller.pedometer.stepCount);
		}
	},

	/**
	 * Process a bluetooth event
	 * @param  {Object} data
	 * @return {void}
	 */
	_bluetoothObservation(data) {

		if (this.controller !== undefined) {

			if(config.exportData) {
				data.timestamp = new Date().getTime();

				this.observations.bluetooth.push(data);
			}
			this.controller.addDeviceObservation(data.address, data.rssi, data.name);
		}
	},

	/**
	 * Lock the device orientation based on the platform
	 * @return {void}
	 */
	_lockDeviceOrientation() {

		let setting = false;

		switch(device.platform) {
			case "iOS":
				setting = config.deviceOrientation.ios;
				break;

			case "android":
				setting = config.deviceOrientation.android;
				break;
		}

		/*
		global screen
		 */
		if (!setting) {
			screen.unlockOrientation();
		}
		else {
			screen.lockOrientation(setting);
		}
	}
};
