import React, { Component } from "react";
import RecordButton from "./RecordButton";
import ActionButton from "./ActionButton";
import AudioAnalyzer from "./AudioAnalyzer";
import RecordingTimeManager from "./RecordingTimeManager";
import RecordingState, { RecordingStateActions } from "./RecordingState";
import { ActionItemAnnotation } from "./Annotation";
import Utils from "./Utils";
import { RecordRTCPromisesHandler } from "recordrtc";

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

                this.setState({
                    recordingState: RecordingState.RECORDING,
                    audioStream: stream
                });
                break;
            case RecordingStateActions.STOP:
                await this._recorder.stopRecording();
                let blob = await this._recorder.getBlob();
                console.log(blob);
                let dataUrl = await this._recorder.getDataURL();
                console.log(dataUrl);
                this._recordingTimeManager.stop();
                this.setState({
                    recordingState: RecordingState.OFF,
                    audioStream: null,
                    elapsedTimeMs: 0
                });
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
                    <RecordButton
                        isRecording={
                            this.state.recordingState ===
                            RecordingState.RECORDING
                        }
                        onRecordPressed={this.toggleRecording}
                    />
                    {this.state.audioStream ? (
                        <AudioAnalyzer
                            className="AudioAnalyzer"
                            recordingState={this.state.recordingState}
                            audioStream={this.state.audioStream}
                        />
                    ) : (
                        <div className="AudioAnalyzer" />
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
