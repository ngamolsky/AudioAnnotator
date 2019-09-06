import React from "react";
import PropTypes from "prop-types";
import record from "./assets/record.svg";
import stop from "./assets/stop.svg";
import "./App.css";

class RecordButton extends React.Component {
    render() {
        return (
            <img
                className={"RecordButton"}
                src={this.props.isRecording ? stop : record}
                onClick={this.props.onRecordPressed}
            />
        );
    }
}

RecordButton.propTypes = {
    isRecording: PropTypes.bool,
    onRecordPressed: PropTypes.func
};

export default RecordButton;
