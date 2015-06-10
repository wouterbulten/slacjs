class DataStore {

    constructor() {

    }

    save(data) {

        data = JSON.stringify(data);
        
        /*
        global window
         */
        window.resolveLocalFileSystemURL(this._storageDir(), function(dir) {
            console.log("Got main dir " + dir.fullPath);
            dir.getFile("slac_datafile_" + (new Date).getTime() + ".json", {create:true}, function(file) {
                console.log("Got file object " + file);

                file.createWriter(function(fileWriter) {

                    fileWriter.seek(fileWriter.length);
                    fileWriter.write(data);
                    console.log("Saved to " + fileWriter.fileName);

                    navigator.notification.alert(
                        'Data saved!',
                        null,
                        'Status',
                        'Ok'
                    );

                }, function(error) {
                    navigator.notification.alert(
                    'Could not save data with error code: ' + error.code,
                    null,
                    'Status',
                    'Sorry!')
                });
            });
        }, function(error) {
            navigator.notification.alert(
            'Could not save data with error code: ' + error.code,
            null,
            'Status',
            'Sorry!')
        });

    }

    /**
     * Return the storage dir based on the platform
     * @return {String}
     */
    _storageDir() {

        /*
        global device, cordova
         */
        switch(device.platform) {
            case "iOS":
                return cordova.file.documentsDirectory;

            case "android":
                return cordova.file.externalDataDirectory;

            default:
                console.error('[SLACjs] Unsupported platform for data store.');
        }
    }
}

export default DataStore;
