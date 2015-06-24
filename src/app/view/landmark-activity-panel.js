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

    _friendlyName(name) {
        return name.split('_')[0];
    }
}

export default LandmarkActivityPanel;
