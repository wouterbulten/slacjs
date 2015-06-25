import config from '../config';

class LandmarkActivityPanel {

    constructor(container) {
        this.landmarks = new Map();

        $(container).append('<div class="beacon-list"></div>');

        this.element = $(container + ' .beacon-list');
    }

    processEvent(uid, name, event, msg) {

        if(!this.landmarks.has(uid)) {
            this._addLandmark(uid, name);
        }

        const landmark = this.landmarks.get(uid);

        landmark.visible = true;

        if(event == 'moved') {
            landmark.moved = true;
        }

        return;
    }

    render() {

        this.landmarks.forEach((l) => {
            l.element.toggleClass('beacon-inactive', !l.visible);
            l.element.toggleClass('beacon-moved', l.moved);
            l.element.toggleClass('beacon-new', l.new);

            //Reset all the states
            l.visible = false;
            l.moved = false;
            l.new = false;
        });
    }

    reset() {
        $(this.element).html("");
        this.landmarks.clear();
    }

    _addLandmark(uid, name) {

        const uiId = 'activity-' + uid;
        const friendlyName = this._friendlyName(name);

        $(this.element).append(
            `
            <span class="${uiId}">
                <span class="fa-stack">
                    <span class="fa fa-stack-1x fa-location-arrow moved-icon"></span>
                    <span class="fa fa-stack-1x fa-plus new-icon"></span>
                    <span class="fa fa-stack-2x fa-square-o"></span>
                </span>
                <span class="fa-stack">
                    <span class="fa fa-circle fa-stack-1x visibility-icon"></span>
                    <span class="fa fa-circle-thin fa-stack-2x"></span>
                </span>
                &nbsp; ${friendlyName}
                <br>
            </span>
            `
        );

        this.landmarks.set(uid, {
            uid: uid,
            name: name,
            friendlyName: friendlyName,
            element: $(`.${uiId}`),
            visible: true,
            uiId: uiId,
            moved: false,
            new: true,
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
