import React, { Component } from "react";
import RecordingState from "./RecordingState";

const AUDIO_BUCKET_SIZE = 128;

class AudioVisualiser extends Component {
    constructor(props) {
        super(props);
        this.canvas = React.createRef();
        this.audioArray = [];
        this.state = {};
    }

    shouldComponentUpdate(nextProps) {
        return this.props.audioAmplitude !== nextProps.audioAmplitude;
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.recordingState === RecordingState.RECORDING) {
            this.draw();
        }
    }

    draw() {
        const { audioAmplitude } = this.props;

        const canvas = this.canvas.current;
        const height = canvas.height;
        const width = canvas.width;

        const context = canvas.getContext("2d");

        context.clearRect(0, 0, width, height);

        if (this.audioArray.length === 0) {
            this.audioArray[0] = audioAmplitude;
        } else if (this.audioArray.length === AUDIO_BUCKET_SIZE) {
            this.audioArray.pop();
        }

        this.audioArray.unshift(audioAmplitude);

        var barWidth = width / AUDIO_BUCKET_SIZE;

        this.audioArray.forEach((amplitude, index) => {
            var barHeight = 10 + amplitude * 4;
            context.fillStyle = "rgb(" + (barHeight + 100) + ", 50, 50)";
            context.fillRect(
                width - barWidth * (index + 1) + 10,
                height / 2 - barHeight / 4,
                barWidth - 10,
                barHeight / 2
            );
        });
    }

    render() {
        return <canvas width="800" height="200" ref={this.canvas} />;
    }
}

export default AudioVisualiser;
