import React, { Component } from "react";
import ActionButton from "./ActionButton";
import AudioAnalyzer from "./AudioAnalyzer";
import RecordingTimeManager from "./RecordingTimeManager";
import RecordingState, { RecordingStateActions } from "./RecordingState";
import { ActionItemAnnotation } from "./Annotation";
import Utils from "./Utils";
import { RecordRTCPromisesHandler, getSeekableBlob } from "recordrtc";
import ReactAudioPlayer from "react-audio-player";
import Fab from "@material-ui/core/Fab";
import PlayArrow from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";

import "./App.css";

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            recordingState: RecordingState.OFF,
            audioStream: null,
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
                if (this._audioAnalyzer) {
                    this._audioAnalyzer.resume();
                }

                this.setState({
                    recordingState: RecordingState.RECORDING,
                    audioStream: stream
                });
                break;
            case RecordingStateActions.STOP:
                await this._recorder.stopRecording();
                getSeekableBlob(
                    await this._recorder.getBlob(),
                    seekableBlob => {
                        this._recordingTimeManager.stop();
                        this._audioAnalyzer.pause();
                        this.setState({
                            recordingState: RecordingState.OFF,
                            audioUrl: URL.createObjectURL(seekableBlob),
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
        return (
            <div className="App">
                <header className="App-header">
                    <h1 className="Duration">
                        {Utils.secondsToTimeString(
                            this.state.elapsedTimeMs / 1000
                        )}
                    </h1>
                    <Fab aria-label="delete" onClick={this.toggleRecording}>
                        {this.state.recordingState ===
                        RecordingState.RECORDING ? (
                            <PauseIcon />
                        ) : (
                            <PlayArrow />
                        )}
                    </Fab>
                    {this.state.audioStream ? (
                        <AudioAnalyzer
                            className="AudioAnalyzer"
                            ref={element => {
                                if (element) {
                                    this._audioAnalyzer = element;
                                }
                            }}
                            recordingState={this.state.recordingState}
                            audioStream={this.state.audioStream}
                        />
                    ) : (
                        <div className={"AudioAnalyzer"} />
                    )}

                    {this.state.audioUrl && (
                        <ReactAudioPlayer
                            className={"AudioPlayer"}
                            src={this.state.audioUrl}
                            ref={element => {
                                if (element) {
                                    this._audioPlayer = element;
                                }
                            }}
                            controls
                        />
                    )}

                    <table className="App-table" cellSpacing="12px">
                        <tbody>
                            <tr>
                                <td>
                                    <ActionButton
                                        name={"Action Item"}
                                        onAnnotationButtonClicked={buttonName => {
                                            if (buttonName === "Action Item") {
                                                const actionItem = new ActionItemAnnotation(
                                                    this.state.elapsedTimeMs
                                                );

                                                console.log(actionItem);
                                            }
                                        }}
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </header>
            </div>
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
        } else {
            this.setState({
                recordingState: this.state.recordingState.start()
            });
        }
    };

    requestPermission = async () => {
        let stream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true
        });

        return stream;
    };
}

export default App;
