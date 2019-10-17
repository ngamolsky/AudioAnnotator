import React, { Component } from "react";

import { RecordRTCPromisesHandler, getSeekableBlob } from "recordrtc";

import ActionButton from "./ActionButton";
import RecordButton from "./RecordButton";
import AudioVisualizer from "./AudioVisualizer";
import RecordingTimeManager from "./RecordingTimeManager";
import RecordingState, { RecordingStateActions } from "./RecordingState";
import Utils from "./Utils";
import { ActionItemAnnotation } from "./Annotation";

import { withStyles } from "@material-ui/styles";
import Box from "@material-ui/core/Box";

const styles = theme => {
    return {
        Duration: {
            margin: 0,
            padding: "30px",
            textAlign: "center",
            color: "#fff",
            fontSize: 50,
            fontWeight: "lighter"
        },
        Visualizer: {
            width: "80%",
            height: "20%"
        },
        Container: {
            height: "100%"
        },
        Annotation: {
            padding: "8px"
        },
        AnnotationIcon: {
            height: "30px",
            width: "30px",
            marginRight: "2px"
        },
        ActionButton: {
            marginBottom: "40px"
        }
    };
};

class RecordingScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            recordingState: RecordingState.OFF,
            elapsedTimeMs: 0,
            stream: null
        };

        this._recordingTimeManager = new RecordingTimeManager(
            this._onMsIntervalTick,
            10
        );
    }

    componentDidMount = () => {
        const script = document.createElement("script");
        script.src = "https://cdn.webrtc-experiment.com/EBML.js";
        script.async = true;
        document.body.appendChild(script);
    };

    componentDidUpdate = async (prevProps, prevState) => {
        const recordingStateAction = this.state.recordingState.compareToPrevious(
            prevState.recordingState
        );
        switch (recordingStateAction) {
            case RecordingStateActions.START:
                let stream = await this._requestPermission();
                this._recordingTimeManager.start();
                this._recorder = new RecordRTCPromisesHandler(stream, {
                    type: "audio"
                });
                await this._recorder.startRecording();
                this.setState({
                    recordingState: RecordingState.RECORDING,
                    stream: stream
                });
                break;
            case RecordingStateActions.STOP:
                await this._recorder.stopRecording();
                getSeekableBlob(
                    await this._recorder.getBlob(),
                    seekableBlob => {
                        this._recordingTimeManager.stop();
                        this._audioAnalyzer.stop();
                        this.props.onAudioUrlAdded(
                            URL.createObjectURL(seekableBlob)
                        );
                    }
                );

                this.setState({
                    recordingState: RecordingState.OFF,
                    stream: null
                });
                break;
            default:
                break;
        }
    };

    render() {
        const { classes } = this.props;
        return (
            <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                className={classes.Container}
            >
                <Box>
                    <h1 className={classes.Duration}>
                        {Utils.secondsToTimeString(
                            this.state.elapsedTimeMs / 1000,
                            false
                        )}
                    </h1>
                </Box>
                <Box>
                    <RecordButton
                        onClick={this._toggleRecording}
                        recordingState={this.state.recordingState}
                    />
                </Box>
                <Box
                    flexGrow={1}
                    justifyContent="center"
                    display="flex"
                    flexDirection="column"
                >
                    <Box>
                        <AudioVisualizer
                            ref={element => {
                                if (element) {
                                    this._audioAnalyzer = element;
                                }
                            }}
                            recordingState={this.state.recordingState}
                            stream={this.state.stream}
                            annotations={this.props.annotations}
                            elapsedTimeMs={this.state.elapsedTimeMs}
                        />
                    </Box>
                </Box>
                <Box className={classes.ActionButton}>
                    <ActionButton
                        name={"Action Item"}
                        onAnnotationButtonClicked={
                            this._onAnnotationButtonClicked
                        }
                        annotationCount={this.props.annotations.length}
                        disabled={this.state.stream == null}
                    />
                </Box>
            </Box>
        );
    }

    _onMsIntervalTick = elapsedTimeMs => {
        this.setState({
            elapsedTimeMs: elapsedTimeMs
        });
    };

    _toggleRecording = async () => {
        if (this.state.recordingState === RecordingState.RECORDING) {
            this.setState({
                recordingState: this.state.recordingState.stop()
            });
        } else if (this.state.recordingState === RecordingState.OFF) {
            this.setState({
                recordingState: this.state.recordingState.start()
            });
        }
    };

    _requestPermission = async () => {
        let stream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true
        });

        return stream;
    };

    _onAnnotationButtonClicked = () => {
        if (this.state.recordingState === RecordingState.RECORDING) {
            const actionItem = new ActionItemAnnotation(
                this.state.elapsedTimeMs
            );
            this.props.onAnnotationAdded(actionItem);
        }
    };
}

export default withStyles(styles)(RecordingScreen);
