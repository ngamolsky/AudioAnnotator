export default class RecordingTimeManager {
    constructor(onIntervalTick, interval) {
        this._recordingInterval = null;
        this._recordingStartTimeMs = null;
        this._recordingPausedPeriods = {};
        this._currentRecordingPausedStartTime = null;
        this._onIntervalTick = onIntervalTick;
        this._interval = interval;
    }

    setOnIntervalTick(onIntervalTick) {
        this._onIntervalTick = onIntervalTick;
    }

    start = () => {
        this._recordingStartTimeMs = Date.now();
        this._recordingInterval = setInterval(() => {
            this._onIntervalTick &&
                this._onIntervalTick(this.getElapsedTimeMs());
        }, this._interval && this._interval);
    };

    pause = () => {
        this._currentRecordingPausedStartTime = Date.now();
        this._recordingPausedPeriods[
            this._currentRecordingPausedStartTime
        ] = null;
    };

    resume = () => {
        this._recordingPausedPeriods[
            this._currentRecordingPausedStartTime
        ] = Date.now();
        this._currentRecordingPausedStartTime = null;
    };

    stop = () => {
        clearInterval(this._recordingInterval);
        this._recordingInterval = null;
        this._recordingStartTimeMs = null;
        this._recordingPausedPeriods = {};
        this._currentRecordingPausedStartTime = null;
    };

    isStarted = () => this._recordingInterval;

    getElapsedTimeMs = () => {
        const nowMs = Date.now();
        const totalPausedTimeMs = Object.keys(this._recordingPausedPeriods)
            .map(startTime => {
                let endTime = this._recordingPausedPeriods[startTime] || nowMs;
                return endTime - startTime;
            })
            .reduce((total, currentDuration) => total + currentDuration, 0);
        const elapsedRecordingTimeMs =
            nowMs - this._recordingStartTimeMs - totalPausedTimeMs;
        return elapsedRecordingTimeMs;
    };
}
