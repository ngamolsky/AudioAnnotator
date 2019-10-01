import React, { Component } from "react";

import { RecordRTCPromisesHandler, getSeekableBlob } from "recordrtc";

import ActionButton from "./ActionButton";
import AudioItem from "./AudioItem";
import RecordButton from "./RecordButton";
import AudioVisualizer from "./AudioVisualizer";
import RecordingTimeManager from "./RecordingTimeManager";
import RecordingState, { RecordingStateActions } from "./RecordingState";
import Utils from "./Utils";
import ReactAudioPlayer from "react-audio-player";
import { ActionItemAnnotation } from "./Annotation";

import blueGrey from "@material-ui/core/colors/blueGrey";
import { withStyles } from "@material-ui/styles";
import Grid from "@material-ui/core/Grid";
import Container from "@material-ui/core/Container";
import Fab from "@material-ui/core/Fab";

import PlayArrow from "@material-ui/icons/PlayArrow";

const styles = {
    App: {
        height: "100%",
        textAlign: "center",
        background: blueGrey[800]
    },
    Duration: {
        margin: 0,
        padding: "30px",
        textAlign: "center",
        color: "#fff",
        fontSize: 50,
        fontWeight: "lighter"
    },
    Grid: {
        height: "100%"
    },
    AnnotationContainer: {
        minHeight: "100px"
    },
    Annotation: {
        padding: "8px"
    },
    AnnotationIcon: {
        height: "30px",
        width: "30px",
        marginRight: "2px"
    },
    AudioContainer: {
        minHeight: "340px"
    },
    AudioPlayer: {
        width: "800px",
        marginTop: "100px",
        marginBottom: "40px"
    }
};

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            recordingState: RecordingState.OFF,
            audioItem: new AudioItem([], null, null),
            elapsedTimeMs: 0
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
                let stream = await this.requestPermission();
                this._recordingTimeManager.start();
                this._recorder = new RecordRTCPromisesHandler(stream, {
                    type: "audio"
                });
                await this._recorder.startRecording();
                let annotations = this.state.audioItem.annotations;
                this.setState({
                    recordingState: RecordingState.RECORDING,
                    audioItem: new AudioItem(annotations, null, stream)
                });
                break;
            case RecordingStateActions.STOP:
                await this._recorder.stopRecording();
                getSeekableBlob(
                    await this._recorder.getBlob(),
                    seekableBlob => {
                        this._recordingTimeManager.stop();
                        this._audioAnalyzer.stop();
                        this.setState({
                            recordingState: RecordingState.OFF,
                            audioItem: {
                                ...this.state.audioItem,
                                url: URL.createObjectURL(seekableBlob)
                            },
                            elapsedTimeMs: 0
                        });
                    }
                );

                break;
            default:
                break;
        }
    };

    render() {
        const { classes } = this.props;
        return (
            <Container className={classes.App} maxWidth={false}>
                <Grid
                    container
                    direction="column"
                    alignItems="center"
                    className={classes.Grid}
                >
                    <Grid item>
                        <h1 className={classes.Duration}>
                            {Utils.secondsToTimeString(
                                this.state.elapsedTimeMs / 1000
                            )}
                        </h1>
                    </Grid>
                    <Grid item>
                        <RecordButton
                            onClick={this.toggleRecording}
                            recordingState={this.state.recordingState}
                            hasRecording={
                                this.state.audioItem &&
                                this.state.audioItem.url != null
                            }
                        />
                    </Grid>
                    <Grid item className={classes.AudioContainer}>
                        {this.state.audioItem && this.state.audioItem.url ? (
                            <ReactAudioPlayer
                                className={classes.AudioPlayer}
                                src={this.state.audioItem.url}
                                controls
                                ref={player => {
                                    if (player) {
                                        this._audioPlayer = player;
                                    }
                                }}
                            />
                        ) : (
                            <AudioVisualizer
                                ref={element => {
                                    if (element) {
                                        this._audioAnalyzer = element;
                                    }
                                }}
                                recordingState={this.state.recordingState}
                                audioItem={this.state.audioItem}
                                elapsedTimeMs={this.state.elapsedTimeMs}
                            />
                        )}
                    </Grid>
                    <Grid
                        container
                        direction="row"
                        justify="flex-start"
                        alignItems="center"
                        className={classes.AnnotationContainer}
                    >
                        {this.state.audioItem &&
                            this.state.audioItem.annotations &&
                            this.state.audioItem.annotations.length !== 0 &&
                            this.state.audioItem.annotations.map(annotation => (
                                <Grid
                                    item
                                    className={classes.Annotation}
                                    key={annotation.id}
                                >
                                    <Fab
                                        variant="extended"
                                        disabled={!this.state.audioItem.url}
                                        onClick={() => {
                                            if (
                                                this.state.audioItem.url !=
                                                    null &&
                                                this._audioPlayer != null
                                            ) {
                                                if (this._audioPlayer.audioEl) {
                                                    this._audioPlayer.audioEl.currentTime =
                                                        (annotation.timestamp -
                                                            annotation.totalDuration /
                                                                2) /
                                                        1000;

                                                    this._audioPlayer.audioEl.play();
                                                }
                                            }
                                        }}
                                    >
                                        <PlayArrow
                                            className={classes.AnnotationIcon}
                                        />
                                        {annotation.type}
                                    </Fab>
                                </Grid>
                            ))}
                    </Grid>
                    <Grid item>
                        <ActionButton
                            name={"Action Item"}
                            durationSecondsString={"10s"}
                            onAnnotationButtonClicked={this._onAnnotationButtonClicked()}
                            disabled={
                                this.state.audioItem.stream == null &&
                                this.state.audioItem.url == null
                            }
                        />
                    </Grid>
                </Grid>
            </Container>
        );
    }

    _onMsIntervalTick = elapsedTimeMs => {
        this.setState({
            elapsedTimeMs: elapsedTimeMs
        });
    };

    toggleRecording = async () => {
        if (this.state.recordingState === RecordingState.RECORDING) {
            this.setState({
                recordingState: this.state.recordingState.stop()
            });
        } else if (this.state.recordingState === RecordingState.OFF) {
            if (this.state.audioItem && this.state.audioItem.url == null) {
                this.setState({
                    recordingState: this.state.recordingState.start()
                });
            } else {
                this.setState({
                    audioItem: new AudioItem([], null, null)
                });
            }
        }
    };

    requestPermission = async () => {
        let stream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true
        });

        return stream;
    };

    _onAnnotationButtonClicked() {
        return buttonName => {
            if (buttonName === "Action Item") {
                let actionItem;
                if (this.state.recordingState === RecordingState.RECORDING) {
                    actionItem = new ActionItemAnnotation(
                        this.state.elapsedTimeMs
                    );
                } else {
                    if (this.state.audioItem.url) {
                        actionItem = new ActionItemAnnotation(
                            this._audioPlayer.audioEl.currentTime * 1000
                        );
                    }
                }

                const prevAudioItem = this.state.audioItem;
                let newAudioItem = new AudioItem(
                    [...prevAudioItem.annotations, actionItem],
                    prevAudioItem.url,
                    prevAudioItem.stream
                );
                this.setState({
                    audioItem: newAudioItem
                });
            }
        };
    }
}

export default withStyles(styles)(App);
