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
        this.source = props.audioStream
            ? this.audioContext.createMediaStreamSource(props.audioStream)
            : null;

        this.source.connect(this.analyser);
        this.state = {};
    }

    componentDidMount() {
        this.timerID = setInterval(() => {
            if (this.props.recordingState === RecordingState.RECORDING) {
                this._onRefreshVisualizer();
            }
        }, 30);
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
        this.analyser.disconnect();
        this.source.disconnect();
    }

    resume = () => {
        this.timerID = setInterval(() => {
            if (this.props.recordingState === RecordingState.RECORDING) {
                this._onRefreshVisualizer();
            }
        }, 30);
    };

    pause = () => {
        clearInterval(this.timerID);
    };

    _onRefreshVisualizer = () => {
        this.analyser.getByteFrequencyData(this.dataArray);
        let values = 0;
        for (var i = 0; i < this.dataArray.length; i++) {
            values += this.dataArray[i];
        }

        let average = values / this.dataArray.length;
        this.setState({
            audioAmplitude: average
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
