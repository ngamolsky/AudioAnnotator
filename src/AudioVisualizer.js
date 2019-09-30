import React, { Component } from "react";
import RecordingState from "./RecordingState";
import { withStyles } from "@material-ui/styles";

const BAR_WIDTH_PX = 6;
const REFRESH_INTERVAL_MS = 30;
const CANVAS_MIN_WIDTH = 800;

const styles = {
    Scroll: {
        width: "800px",
        height: "200px",
        overflow: "hidden",
        direction: "rtl",
        margin: "20px",
        flexGrow: "1",
        alignSelf: "center"
    },
    Canvas: {
        float: "right",
        height: 200
    }
};

class AudioVisualizer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            audioArray: [],
            width: 0
        };

        this.canvas = React.createRef();
    }

    componentDidUpdate = (prevProps, prevState) => {
        if (prevState.audioArray !== this.state.audioArray) {
            this._draw();
        }
        const prevAudioItem = prevProps.audioItem;
        const audioItem = this.props.audioItem;
        if (!prevAudioItem.hasMedia() && audioItem.hasMedia()) {
            this.audioContext = new (window.AudioContext ||
                window.webkitAudioContext)();

            this.analyser = this.audioContext.createAnalyser();
            this.analyser.smoothingTimeConstant = 0;
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

            if (audioItem.stream) {
                this.source = this.audioContext.createMediaStreamSource(
                    audioItem.stream
                );
                this.source.connect(this.analyser);
            } else if (audioItem.url) {
                console.log("HAVE URL");
            }

            this.timerID = setInterval(() => {
                if (this.props.recordingState === RecordingState.RECORDING) {
                    this._onRefreshVisualizer();
                }
            }, REFRESH_INTERVAL_MS);
        } else if (prevProps.audioStream && this.props.audioStream == null) {
            this.analyser.disconnect();
            this.source.disconnect();
            this.setState({
                audioArray: [],
                width: CANVAS_MIN_WIDTH
            });
        }
    };

    componentWillUnmount = () => {
        clearInterval(this.timerID);

        this.analyser.disconnect();
        this.source.disconnect();
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

        let newAudioArray = [...this.state.audioArray];
        const currentAnnotation =
            this.props.audioItem &&
            this.props.audioItem.getAnnotationForTimestamp(
                this.props.elapsedTimeMs
            );
        if (currentAnnotation != null) {
            const annotatedValues = this.state.audioArray
                .slice(
                    -currentAnnotation.totalDuration / 2 / REFRESH_INTERVAL_MS
                )
                .map(
                    chunk =>
                        (chunk = {
                            amplitude: chunk.amplitude,
                            annotated: true,
                            timestamp: chunk.elapsedTimeMs
                        })
                );

            newAudioArray.splice(
                newAudioArray.length - annotatedValues.length,
                currentAnnotation.totalDuration / 2 / REFRESH_INTERVAL_MS,
                ...annotatedValues
            );
        }

        const average = values / this.dataArray.length;
        if (average > 0) {
            this.setState({
                width: this.state.audioArray.length * BAR_WIDTH_PX,
                audioArray: [
                    ...newAudioArray,
                    {
                        amplitude: average,
                        annotated: currentAnnotation != null,
                        timestamp: this.props.elapsedTimeMs
                    }
                ]
            });
        }
    };

    _draw = () => {
        const canvas = this.canvas.current;

        const height = canvas.height;
        const width = canvas.width;

        const context = canvas.getContext("2d");

        context.clearRect(0, 0, width, height);

        this.state.audioArray.forEach((chunk, index) => {
            var barHeight = 5 + chunk.amplitude;
            context.fillStyle = chunk.annotated
                ? "rgb(255, 215, 0)"
                : "rgb(" + (barHeight + 100) + ", 50, 50)";

            context.fillRect(
                index * BAR_WIDTH_PX,
                height / 2 - barHeight,
                BAR_WIDTH_PX * 0.6,
                barHeight * 2
            );
        });
    };

    render() {
        const { classes } = this.props;
        return (
            <div className={classes.Scroll}>
                <canvas
                    className={classes.Canvas}
                    width={this.state.width}
                    ref={this.canvas}
                />
            </div>
        );
    }
}

export default withStyles(styles)(AudioVisualizer);
