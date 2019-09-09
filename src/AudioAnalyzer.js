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
        this.analyser.smoothingTimeConstant = 0.1;
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
            this._recordingTimeManager = new RecordingTimeManager(
                elapsedTimeMs => {
                    this.analyser.getByteFrequencyData(this.dataArray);
                    let amplitude;
                    let maxAmpltiude = 0;
                    for (var i = 0; i < this.dataArray.length; i++) {
                        amplitude = this.dataArray[i];

                        if (amplitude > maxAmpltiude) {
                            maxAmpltiude = amplitude;
                        }
                    }

                    this.setState({
                        audioAmplitude: maxAmpltiude
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
        return <AudioVisualizer audioAmplitude={this.state.audioAmplitude} />;
    }
}

export default AudioAnalyser;
