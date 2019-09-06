import React, { Component } from "react";
import RecordButton from "./RecordButton";
import ActionButton from "./ActionButton";
import AudioAnalyzer from "./AudioAnalyzer";

import "./App.css";

const RECORDING_STATES = {
    OFF: "OFF",
    STARTING: "STARTING",
    READY: "READY",
    PAUSED: "PAUSED",
    STOPPED: "STOPPED",
    PLAYING: "PLAYING",
    RECORDING: "RECORDING"
};

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            recording: RECORDING_STATES.OFF,
            audio: null
        };
    }

    componentDidMount() {}

    componentWillUnmount() {}

    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <RecordButton
                        isRecording={
                            this.state.recording !== RECORDING_STATES.OFF
                        }
                        onRecordPressed={this.toggleRecording}
                    />
                    <AudioAnalyzer
                        audio={this.state.audio}
                        recordingState={this.state.recording}
                    />
                    <table className="App-table" cellSpacing="12px">
                        <tbody>
                            <tr>
                                <td>
                                    <ActionButton name={"Action Item"} />
                                </td>
                                <td>
                                    <ActionButton name={"Research Topic"} />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <ActionButton name={"Decision"} />
                                </td>
                                <td>
                                    <ActionButton name={"Important Point"} />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </header>
            </div>
        );
    }

    toggleRecording = async () => {
        if (this.state.recording === RECORDING_STATES.RECORDING) {
            this.state.audio.getTracks().forEach(track => track.stop());
            this.setState({ recording: RECORDING_STATES.OFF });
        } else {
            let stream = await this.requestPermission();
            this.setState({
                audio: stream,
                recording: RECORDING_STATES.RECORDING
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
