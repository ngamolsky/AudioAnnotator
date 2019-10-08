import React, { Component } from "react";

import RecordingScreen from "./RecordingScreen";
import SummaryScreen from "./SummaryScreen";

import blueGrey from "@material-ui/core/colors/blueGrey";
import { withStyles } from "@material-ui/styles";
import Container from "@material-ui/core/Container";

const styles = {
    App: {
        height: "100%",
        textAlign: "center",
        background: blueGrey[800]
    }
};

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            audioItem: null
        };
    }

    render() {
        const { classes } = this.props;
        return (
            <Container className={classes.App} maxWidth={false}>
                {this.state.audioItem == null ? (
                    <RecordingScreen
                        onAudioItemAdded={this._onAudioItemAdded}
                    />
                ) : (
                    <SummaryScreen
                        audioItem={this.state.audioItem}
                        onReset={this._onReset}
                    />
                )}
            </Container>
        );
    }

    _onAudioItemAdded = audioItem => {
        this.setState({
            audioItem: audioItem
        });
    };

    _onReset = () => {
        this.setState({
            audioItem: null
        });
    };
}

export default withStyles(styles)(App);
