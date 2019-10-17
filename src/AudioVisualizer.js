import React, { Component } from "react";
import Measure from "react-measure";

import RecordingState from "./RecordingState";
import { withStyles } from "@material-ui/styles";
import Utils from "./Utils";

const REFRESH_INTERVAL_MS = 60;
const MAX_BARD_WIDTH = 6;

const styles = {
    Canvas: {
        display: "block"
    },
    Visualizer: {
        width: "80%",
        height: "200px",
        margin: "auto"
    }
};

class AudioVisualizer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            audioArray: [],
            mousePosition: {
                x: 0,
                y: 0
            },
            canvasSize: {
                width: -1,
                height: -1
            },
            totalArray: []
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
            this.setState(
                state => {
                    return {
                        ...state,
                        audioArray: []
                    };
                },
                () => {
                    console.log("WHY");
                    this._draw();
                }
            );
        }

        if (prevState.canvasSize.width < 0 && this.state.canvasSize.width > 0) {
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
        const averageAmplitude = values / this.dataArray.length;

        this.setState(state => {
            let newAudioArray = [...state.audioArray];
            if (
                state.audioArray.length >=
                Math.floor(state.canvasSize.width / MAX_BARD_WIDTH)
            ) {
                newAudioArray.shift();
            }

            return {
                audioArray: [
                    ...newAudioArray,
                    {
                        amplitude: averageAmplitude,
                        timestamp: this.props.elapsedTimeMs,
                        x: Math.floor(MAX_BARD_WIDTH * state.audioArray.length)
                    }
                ],
                totalArray: [
                    ...state.totalArray,
                    {
                        amplitude: averageAmplitude,
                        timestamp: this.props.elapsedTimeMs,
                        x: Math.floor(MAX_BARD_WIDTH * state.audioArray.length)
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
            const arrayLength = this.state.audioArray.length;
            const context = canvas.getContext("2d");
            context.clearRect(0, 0, width, height);

            if (arrayLength === 0) {
                this.state.totalArray.forEach((chunk, index) => {
                    const currentAnnotations = Utils.getAnnotationsForTimestamp(
                        chunk.timestamp,
                        this.props.annotations ? this.props.annotations : []
                    );

                    const barHeight = 2 + chunk.amplitude;
                    const barWidth =
                        this.state.canvasSize.width /
                        this.state.totalArray.length;
                    const redOpacity = 0.2 + barHeight / 50;
                    const whiteOpacity = currentAnnotations.length / 5;
                    const redColor = "rgba(244, 67, 54," + redOpacity + ")";
                    const goldColor = "rgba(255, 196, 0," + redOpacity + ")";
                    const whiteColor =
                        "rgba(255, 255, 255, " + whiteOpacity + ")";
                    const rect = {
                        x:
                            width -
                            (this.state.totalArray.length - index) * barWidth,
                        y: height / 2 - barHeight,
                        width: barWidth * 0.6,
                        height: barHeight * 2
                    };

                    console.log(rect);

                    const isMouseOverRect =
                        this.state.mousePosition.x > rect.x &&
                        this.state.mousePosition.x < rect.x + barWidth;

                    context.fillStyle =
                        currentAnnotations.length > 0 ? whiteColor : redColor;

                    context.fillRect(rect.x, rect.y, rect.width, rect.height);
                });
            } else {
                this.state.audioArray.forEach((chunk, index) => {
                    const currentAnnotations = Utils.getAnnotationsForTimestamp(
                        chunk.timestamp,
                        this.props.annotations ? this.props.annotations : []
                    );

                    const barHeight = 2 + chunk.amplitude;
                    const redOpacity = 0.2 + barHeight / 50;
                    const whiteOpacity = currentAnnotations.length / 5;
                    const redColor = "rgba(244, 67, 54," + redOpacity + ")";
                    const goldColor = "rgba(255, 196, 0," + redOpacity + ")";
                    const whiteColor =
                        "rgba(255, 255, 255, " + whiteOpacity + ")";
                    const rect = {
                        x: width - (arrayLength - index) * MAX_BARD_WIDTH,
                        y: height / 2 - barHeight,
                        width: MAX_BARD_WIDTH * 0.6,
                        height: barHeight * 2
                    };

                    const isMouseOverRect =
                        this.state.mousePosition.x > rect.x &&
                        this.state.mousePosition.x < rect.x + MAX_BARD_WIDTH;

                    context.fillStyle =
                        currentAnnotations.length > 0 ? whiteColor : redColor;

                    context.fillRect(rect.x, rect.y, rect.width, rect.height);
                });
            }
        }
    };

    render() {
        const { classes } = this.props;
        return (
            this.state.canvasSize != null && (
                <Measure
                    bounds
                    margin
                    onResize={contentRect => {
                        this.setState({ canvasSize: contentRect.bounds });
                    }}
                >
                    {({ measureRef }) => (
                        <div ref={measureRef} className={classes.Visualizer}>
                            <canvas
                                className={classes.Canvas}
                                ref={this.canvas}
                                height={this.state.canvasSize.height}
                                width={this.state.canvasSize.width}
                            />
                        </div>
                    )}
                </Measure>
            )
        );
    }
}

export default withStyles(styles)(AudioVisualizer);
