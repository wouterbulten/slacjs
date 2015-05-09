import LandmarkInitializationSet from '../models/landmark-init';

if (window.test === undefined) {
	window.test = {};
}

window.test.landmarkInit = {

	landmarkSet: undefined,

	initialize: function() {
		this.landmarkSet = new LandmarkInitializationSet();
	}
}