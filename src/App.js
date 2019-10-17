import React, { Component } from "react";

import RecordingScreen from "./RecordingScreen";
import SummaryScreen from "./SummaryScreen";

import { indigo } from "@material-ui/core/colors/";
import { withStyles, ThemeProvider } from "@material-ui/styles";
import { createMuiTheme } from "@material-ui/core/styles";

import Container from "@material-ui/core/Container";

const theme = createMuiTheme({
    palette: {
        primary: {
            main: "#e53935"
        },
        secondary: indigo,
        type: "dark"
    }
});

const styles = {
    App: {
        height: "100%",
        textAlign: "center",
        background: theme.palette.background.default
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
            <ThemeProvider theme={theme}>
                <Container className={classes.App} maxWidth={false}>
                    <RecordingScreen
                        annotations={this.state.annotations}
                        onAudioUrlAdded={this._onAudioUrlAdded}
                        onAnnotationAdded={this._onAnnotationAdded}
                    />
                    {/* {this.state.audioUrl == null ? (
                        
                    ) : (
                        <SummaryScreen
                            audioUrl={this.state.audioUrl}
                            annotations={this.state.annotations}
                            onReset={this._onReset}
                        />
                    )} */}
                </Container>
            </ThemeProvider>
        );
    }

    _onAudioUrlAdded = url => {
        this.setState({
            audioUrl: url
        });
    };

    _onAnnotationAdded = annotation => {
        this.setState(state => {
            console.log(state);
            return {
                ...state,
                annotations: [...state.annotations, annotation]
            };
        });
    };

    _onReset = () => {
        this.setState({
            audioUrl: null,
            annotations: []
        });
    };
}

export default withStyles(styles)(App);
