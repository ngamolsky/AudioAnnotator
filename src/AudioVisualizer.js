import React, { Component } from "react";
import RecordingState from "./RecordingState";
import { withStyles } from "@material-ui/styles";
import Utils from "./Utils";

const BAR_WIDTH_PX = 6;
const REFRESH_INTERVAL_MS = 60;
const CANVAS_WIDTH_PX = 1000;
const CANVAS_HEIGHT_PX = 300;

const styles = {};

class AudioVisualizer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            audioArray: [],
            mousePosition: {
                x: 0,
                y: 0
            }
        };
        this.canvas = React.createRef();
    }

    componentDidUpdate = (prevProps, prevState) => {
        if (this.canvas && this.canvas.current) {
            requestAnimationFrame(this._draw);
        }
        const prevStream = prevProps.stream;
        const stream = this.props.stream;
        if (prevStream == null && stream != null) {
            this.audioContext = new (window.AudioContext ||
                window.webkitAudioContext)();

            this.analyser = this.audioContext.createAnalyser();
            this.analyser.smoothingTimeConstant = 0;
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

            if (stream) {
                this.source = this.audioContext.createMediaStreamSource(stream);
                this.source.connect(this.analyser);
            }

            this.timerID = setInterval(() => {
                if (this.props.recordingState === RecordingState.RECORDING) {
                    this._onRefreshVisualizer();
                }
            }, REFRESH_INTERVAL_MS);
        } else if (prevStream && stream == null) {
            this.setState({
                audioArray: []
            });
        }
    };

    componentDidMount = () => {
        if (this.canvas) {
            this.canvas.current.addEventListener("mousemove", event => {
                var rect = event.target.getBoundingClientRect();
                this.setState({
                    mousePosition: {
                        x: event.clientX - rect.left,
                        y: event.clientY - rect.top
                    }
                });
            });
        }
    };

    componentWillUnmount = () => {
        clearInterval(this.timerID);
        cancelAnimationFrame(this._draw);
        if (this.analyser) {
            this.analyser.disconnect();
        }
        if (this.source) {
            this.source.disconnect();
        }
    };

    stop = () => {
        clearInterval(this.timerID);
    };

    _onRefreshVisualizer = () => {
        this.analyser.getByteFrequencyData(this.dataArray);
        let values = 0;
        for (var i = 0; i < this.dataArray.length; i++) {
            values += this.dataArray[i];
        }

        const average_amplitude = values / this.dataArray.length;

        this.setState(state => {
            let newAudioArray = [...state.audioArray];
            if (
                this.state.audioArray.length >=
                Math.floor(CANVAS_WIDTH_PX / BAR_WIDTH_PX)
            ) {
                newAudioArray.shift();
            }

            const currentAnnotation =
                this.props.annotations &&
                Utils.getAnnotationForTimestamp(
                    this.props.elapsedTimeMs,
                    this.props.annotations
                );
            if (currentAnnotation != null) {
                const annotatedValues = state.audioArray
                    .slice(
                        -(
                            currentAnnotation.totalDuration /
                            2 /
                            REFRESH_INTERVAL_MS
                        )
                    )
                    .map(chunk => ({
                        amplitude: chunk.amplitude,
                        timestamp: chunk.timestamp,
                        selected: chunk.selected,
                        x: chunk.x,
                        annotated: true
                    }));

                newAudioArray.splice(
                    newAudioArray.length - annotatedValues.length,
                    currentAnnotation.totalDuration / 2 / REFRESH_INTERVAL_MS,
                    ...annotatedValues
                );
            }
            return {
                audioArray: [
                    ...newAudioArray,
                    {
                        amplitude: average_amplitude,
                        timestamp: this.props.elapsedTimeMs,
                        x: Math.floor(BAR_WIDTH_PX * state.audioArray.length),
                        selected: false,
                        annotated: currentAnnotation != null
                    }
                ]
            };
        });
    };

    _draw = () => {
        const canvas = this.canvas.current;

        if (canvas) {
            const height = canvas.height;
            const width = canvas.width;

            const context = canvas.getContext("2d");

            context.clearRect(0, 0, width, height);

            this.state.audioArray.forEach((chunk, index) => {
                const barHeight = 2 + chunk.amplitude;
                const opacity = 0.2 + barHeight / 50;
                const redColor = "rgba(244, 67, 54," + opacity + ")";
                const goldColor = "rgba(255, 196, 0," + opacity + ")";
                const whiteColor = "rgb(255, 255, 255)";
                const rect = {
                    x: index * BAR_WIDTH_PX,
                    y: height / 2 - barHeight,
                    width: BAR_WIDTH_PX * 0.6,
                    height: barHeight * 2
                };

                if (
                    this.state.mousePosition.x > rect.x &&
                    this.state.mousePosition.x < rect.x + BAR_WIDTH_PX
                ) {
                    chunk.selected = true;
                } else {
                    chunk.selected = false;
                }

                context.fillStyle = chunk.selected
                    ? whiteColor
                    : chunk.annotated
                    ? goldColor
                    : redColor;

                context.fillRect(
                    index * BAR_WIDTH_PX,
                    height / 2 - barHeight,
                    BAR_WIDTH_PX * 0.6,
                    barHeight * 2
                );
            });
        }
    };

    render() {
        return (
            <canvas
                ref={this.canvas}
                height={CANVAS_HEIGHT_PX}
                width={CANVAS_WIDTH_PX}
            />
        );
    }
}

export default withStyles(styles)(AudioVisualizer);
