import React, { Component } from "react";
import AudioVisualizer from "./AudioVisualizer";

class AudioAnalyser extends Component {
    constructor(props) {
        super(props);
        this.state = { audioAmplitude: 0, tickCount: 0 };
        this.hasAudio = false;
    }

    componentDidMount() {}

    componentDidUpdate() {
        if (
            this.props.audio &&
            !this.hasAudio &&
            this.props.recordingState === "RECORDING"
        ) {
            this.hasAudio = true;

            this.audioContext = new (window.AudioContext ||
                window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 32;
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            this.source = this.audioContext.createMediaStreamSource(
                this.props.audio
            );
            this.source.connect(this.analyser);
            this.rafId = requestAnimationFrame(this.tick);
        } else if (!this.props.audio && this.hasAudio) {
            this.hasAudio = false;
        }

        if (this.props.recordingState === "OFF") {
            this.pause();
            this.hasAudio = false;
        }
    }

    tick = () => {
        this.analyser.getByteFrequencyData(this.dataArray);
        let values = 0;
        var length = this.dataArray.length;
        for (var i = 0; i < length; i++) {
            values += this.dataArray[i];
        }

        let average = values / length;
        let tickCount = this.state.tickCount + 1;
        this.setState({ audioAmplitude: average, tickCount: tickCount });
        this.rafId = requestAnimationFrame(this.tick);
    };

    pause = () => {
        cancelAnimationFrame(this.rafId);
    };

    componentWillUnmount() {
        cancelAnimationFrame(this.rafId);
        this.analyser.disconnect();
        this.source.disconnect();
    }

    render() {
        return this.props.audio ? (
            <AudioVisualizer
                audioAmplitude={this.state.audioAmplitude}
                tickCount={this.state.tickCount}
            />
        ) : (
            <div style={{ height: 200, width: 800 }} />
        );
    }
}

export default AudioAnalyser;
