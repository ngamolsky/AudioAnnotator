export const RecordingStateActions = {
    NONE: "NONE",
    START: "START",
    STOP: "STOP",
    PAUSE: "PAUSE",
    RESUME: "RESUME"
};

// Make RecordingState's constructor effectively private by requiring this token
// to construct, which is only available in this file.
const TOKEN = { token: "unique recording state token" };

class RecordingState {
    constructor(token, status) {
        if (token !== TOKEN) {
            throw new Error(
                "RecordingState is an enum and should not be constructed directly; " +
                    "please use an existing RecordingState.* declared in recording_state.es6.js"
            );
        }

        this._status = status;
    }

    isActive() {
        return (
            this === RecordingState.RECORDING || this === RecordingState.PAUSED
        );
    }

    isRecording() {
        return this === RecordingState.RECORDING;
    }

    isPaused() {
        return this === RecordingState.PAUSED;
    }

    isOff() {
        return this === RecordingState.OFF;
    }

    isStartingOrStopping() {
        return (
            this === RecordingState.STARTING || this === RecordingState.STOPPING
        );
    }

    start() {
        if (this === RecordingState.OFF) {
            return RecordingState.STARTING;
        } else {
            return this;
        }
    }

    stop() {
        if (this === RecordingState.OFF) {
            return RecordingState.OFF;
        } else {
            return RecordingState.STOPPING;
        }
    }

    pause() {
        return RecordingState.PAUSED;
    }

    resume() {
        return RecordingState.RECORDING;
    }

    compareToPrevious(prevRecordingState) {
        if (
            this === RecordingState.STARTING &&
            prevRecordingState === RecordingState.OFF
        ) {
            return RecordingStateActions.START;
        } else if (
            this === RecordingState.STOPPING &&
            prevRecordingState !== RecordingState.STOPPING
        ) {
            return RecordingStateActions.STOP;
        } else if (
            this === RecordingState.RECORDING &&
            prevRecordingState === RecordingState.PAUSED
        ) {
            return RecordingStateActions.RESUME;
        } else if (
            this === RecordingState.PAUSED &&
            prevRecordingState === RecordingState.RECORDING
        ) {
            return RecordingStateActions.PAUSE;
        }
        return RecordingStateActions.NONE;
    }
}

RecordingState.OFF = new RecordingState(TOKEN, "OFF");
RecordingState.STARTING = new RecordingState(TOKEN, "STARTING");
RecordingState.RECORDING = new RecordingState(TOKEN, "RECORDING");
RecordingState.PAUSED = new RecordingState(TOKEN, "PAUSED");
RecordingState.STOPPING = new RecordingState(TOKEN, "STOPPING");

export default RecordingState;
