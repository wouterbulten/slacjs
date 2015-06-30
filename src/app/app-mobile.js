import SlacController from './slac-controller';
import BLE from './device/bluetooth.js';
import MotionSensor from './device/motion-sensor';
import ParticleRenderer from './view/particle-renderer';
import DataStore from './device/data-storage';
import LandmarkActivityPanel from './view/landmark-activity-panel';
import { degreeToRadian, degreeToNormalisedHeading, rotationToLocalNorth } from './util/motion';
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
	lastUiRotation: 0,
	orientationSetting: false,

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
		this.orientationSetting = this._lockDeviceOrientation();

		//Create a new motion sensor object that listens for updates
		//The sensor is working even if the algorithm is paused (to update the view)
		this._startMotionSensing();

		//Start the bluetooth radio
		this._startBluetooth();

		//Bind events to the buttons
		this._bindButtons();

		//Create a view for the panel that displays beacon info
		this.landmarkPanel = new LandmarkActivityPanel('#landmark-info');

		//Update the panel every second
		setInterval(() => {
			this.landmarkPanel.render();
		}, 500);

		//Create a datastore object to save the trace
		this.storage = new DataStore();
	},

	/**
	 * Start the SLACjs algorithm
	 * @return {void}
	 */
	start() {

		console.log('[SLACjs] Starting');

		this.uiElements.btnStart.prop('disabled', true);
		this.uiElements.btnPause.prop('disabled', false);

		if (this.controller !== undefined) {

			if (this.controller.paused) {
				this.controller.start();

				return;
			}

			//When not paused, start resets it
			this.reset();
		}

		//Go in background mode if it is enabled
		if (config.backgroundMode) {
			/*
			global cordova
			 */
			cordova.plugins.backgroundMode.setDefaults({ title: 'SLACjs running', text:'Background monitoring'});
			cordova.plugins.backgroundMode.enable();
		}

		//Create a new controller
		this.controller = new SlacController(config);

		//Create the renderer
		this._createCanvasRenderer();

		//Bind renderer to controller
		this.controller.onUpdate((particles) => {
			this.renderer.render(particles);
		});

		//Add an callback to the controller that runs before the first step
		//Primary goal is to set the right start heading
		this.controller.beforeUpdate((particles, iteration) => {
			if (iteration === 0) {
				this.startHeading = this.motionSensor.heading;

				//Reset the heading to let the first step always be in the same direction
				this.controller.heading = 0.5 * Math.PI;
			}
		});

		//Add a listener to the sensor of the controller
		this.controller.sensor.setEventListener((uid, name, event, msg) => {

			if (event != 'update') {
				console.log(`[SLACjs/sensor] ${uid} (${name}) ${event}, message: "${msg}"`);
			}

			this.landmarkPanel.processEvent(uid, name, event, msg);
		});

		//Reset the view
		this.landmarkPanel.reset();

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
		this.uiElements.btnPause.prop('disabled', true);
		this.uiElements.btnReset.prop('disabled', true);
		this.uiElements.btnExport.prop('disabled', true);

		this.ble.stopListening();
		delete this.controller;

		if (config.backgroundMode) {
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

		this.uiElements.btnPause.prop('disabled', true);
		this.uiElements.btnStart.prop('disabled', false);
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
		if (this.controller !== undefined  && !this.controller.paused) {

			if (config.exportData) {
				data.timestamp = new Date().getTime();

				this.observations.motion.push(data);
			}

			this.controller.addMotionObservation(
				data.x, data.y, data.z,
				degreeToNormalisedHeading(data.heading, this.startHeading) + (0.5 * Math.PI)
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

		if (this.controller !== undefined && !this.controller.paused) {

			if (config.exportData) {
				data.timestamp = new Date().getTime();

				this.observations.bluetooth.push(data);
			}
			this.controller.addDeviceObservation(data.address, data.rssi, data.name);
		}
	},

	/**
	 * Rotate the canvas to local north
	 * @param  {Number} heading
	 * @return {void}
	 */
	_rotateScreen(heading) {
		//Find smallest rotation
		const degree = rotationToLocalNorth(heading, this.lastUiRotation);

		this.uiElements.map.css({
			'-webkit-transform' : 'rotate('+ degree +'deg)',
			'-moz-transform' : 'rotate('+ degree +'deg)',
			'-ms-transform' : 'rotate('+ degree +'deg)',
			'transform' : 'rotate('+ degree +'deg)'
		});

		this.lastUiRotation = heading;
	},

	/**
	 * Lock the device orientation based on the platform
	 * @return {String}
	 */
	_lockDeviceOrientation() {

		let setting = false;

		switch (device.platform) {
			case 'iOS':
				setting = config.deviceOrientation.ios;
				break;

			case 'Android':
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

		return setting;
	},

	/**
	 * Create a new renderer for the canvas
	 * @return {void}
	 */
	_createCanvasRenderer() {
		//Create a renderer for the canvas view
		//Based on the orientation setting, use an offset for the canvas
		let height;
		switch (this.orientationSetting) {
			case 'portrait':
			case 'portrait-secondary':
			case 'portrait-primary':
				height = window.innerHeight - 120;
				break;

			default:
				height = window.innerHeight - 60;
		}

		this.renderer = new ParticleRenderer('slacjs-map', height);
	}
};
