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
            audioUrl: null,
            annotations: []
        };
    }

    render() {
        const { classes } = this.props;
        return (
            <Container className={classes.App} maxWidth={false}>
                {this.state.audioUrl == null ? (
                    <RecordingScreen
                        annotations={this.state.annotations}
                        onAudioUrlAdded={this._onAudioUrlAdded}
                        onAnnotationAdded={this._onAnnotationAdded}
                    />
                ) : (
                    <SummaryScreen
                        audioUrl={this.state.audioUrl}
                        annotations={this.state.annotations}
                        onReset={this._onReset}
                    />
                )}
            </Container>
        );
    }

    _onAudioUrlAdded = url => {
        this.setState({
            audioUrl: url
        });
    };

    _onAnnotationAdded = annotation => {
        this.setState(state => {
            return {
                ...state,
                annotations: [...state.annotations, annotation]
            };
        });
    };

    _onReset = () => {
        this.setState({
            audioUrl: null
        });
    };
}

export default withStyles(styles)(App);
