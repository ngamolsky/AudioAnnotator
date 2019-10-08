import React from "react";
import { withStyles } from "@material-ui/styles";
import Fab from "@material-ui/core/Fab";
import Mic from "@material-ui/icons/Mic";
import Stop from "@material-ui/icons/Stop";
import RecordingState from "./RecordingState";

import red from "@material-ui/core/colors/red";

const styles = {
    RecordingButton: {
        marginBottom: "70px",
        backgroundColor: red["600"],
        "&:hover": {
            backgroundColor: red["200"]
        },
        color: "#fff"
    },
    RecordingButtonLabel: {
        height: "30px",
        width: "30px"
    }
};

class RecordButton extends React.Component {
    render() {
        const { classes } = this.props;

        return (
            <Fab
                className={classes.RecordingButton}
                aria-label="record"
                onClick={this.props.onClick}
            >
                {this.props.recordingState === RecordingState.RECORDING ? (
                    <Stop className={classes.RecordingButtonLabel} />
                ) : (
                    <Mic className={classes.RecordingButtonLabel} />
                )}
            </Fab>
        );
    }
}

export default withStyles(styles)(RecordButton);
