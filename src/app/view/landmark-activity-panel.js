import config from '../config';

class LandmarkActivityPanel {

    constructor(container) {
        this.landmarks = new Map();

        $(container).append('<ul class="fa-ul"></ul>');

        this.element = $(container + ' ul');
    }

    processEvent(uid, name, event, msg) {

        if(!this.landmarks.has(uid)) {
            this._addLandmark(uid, name);
        }

        const landmark = this.landmarks.get(uid);

        landmark.visible = true;

        return;
    }

    render() {

        this.landmarks.forEach((l) => {
            l.statusIcon.toggleClass('fa-check-circle-o', l.visible);
            l.statusIcon.toggleClass('fa-circle-o', !l.visible);

            l.visible = false;
        });
    }

    _addLandmark(uid, name) {

        const uiId = 'activity-' + uid;
        const friendlyName = this._friendlyName(name);

        $(this.element).append(
            `<li class="${uiId}"><i class="fa-li fa fa-check-circle-o"></i>${friendlyName}</li>`
        );

        this.landmarks.set(uid, {
            uid: uid,
            name: name,
            friendlyName: friendlyName,
            statusIcon: $('.' + uiId + ' .fa-li'),
            visible: true,
            uiId: uiId
        });
    }

    /**
     * Convert the name to a more friendly version for showing on screen
     * @param  {String} name
     * @return {String}
     * @todo Make this more dynamic and less beacon dependent
     */
    _friendlyName(name) {
        return config.ble.toFriendlyName(name);
    }
}

export default LandmarkActivityPanel;
