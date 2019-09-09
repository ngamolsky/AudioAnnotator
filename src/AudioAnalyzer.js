import React, { Component } from "react";
import AudioVisualizer from "./AudioVisualizer";
import RecordingTimeManager from "./RecordingTimeManager";

class AudioAnalyser extends Component {
    constructor(props) {
        super(props);

        this.hasStarted = false;
        this.audioContext = new (window.AudioContext ||
            window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048;
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.state = {};
    }

    componentDidUpdate() {
        if (
            this.props.audio &&
            this.props.recordingState === "RECORDING" &&
            !this.hasStarted
        ) {
            this.hasStarted = true;
            this.source = this.audioContext.createMediaStreamSource(
                this.props.audio
            );
            this.source.connect(this.analyser);
            this.tickCount = 0;
            this._recordingTimeManager = new RecordingTimeManager(
                elapsedTimeMs => {
                    this.analyser.getByteFrequencyData(this.dataArray);
                    let values = 0;
                    var length = this.dataArray.length;
                    for (var i = 0; i < length; i++) {
                        values += this.dataArray[i];
                    }

                    let average = values / length;
                    this.setState({
                        audioAmplitude: average
                    });
                },
                100
            );

            this._recordingTimeManager.start();
        }

        if (this.props.recordingState === "OFF") {
            this._recordingTimeManager.stop();
            this.hasStarted = false;
        }
    }

    componentWillUnmount() {
        this.analyser.disconnect();
        this.source.disconnect();
    }

    render() {
        return this.state.audioAmplitude > 0 ? (
            <AudioVisualizer audioAmplitude={this.state.audioAmplitude} />
        ) : (
            <div style={{ height: 200, width: 800 }} />
        );
    }
}

export default AudioAnalyser;
