import React, { Component } from "react";
import AudioVisualizer from "./AudioVisualizer";
import RecordingState from "./RecordingState";

class AudioAnalyzer extends Component {
    constructor(props) {
        super(props);
        this.audioContext = new (window.AudioContext ||
            window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.smoothingTimeConstant = 0;
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.source = this.audioContext.createMediaStreamSource(
            props.audioStream
        );
        this.source.connect(this.analyser);
        this.state = {};
    }

    componentDidMount() {
        this.timerID = setInterval(() => {
            if (this.props.recordingState === RecordingState.RECORDING) {
                this._onRefreshVisualizer();
            }
        }, 100);
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
        this.analyser.disconnect();
        this.source.disconnect();
    }

    _onRefreshVisualizer = () => {
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
    };

    render() {
        return (
            <AudioVisualizer
                recordingState={this.props.recordingState}
                audioAmplitude={this.state.audioAmplitude}
            />
        );
    }
}

export default AudioAnalyzer;
