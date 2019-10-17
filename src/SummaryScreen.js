import React, { Component } from "react";

import ReactAudioPlayer from "react-audio-player";

import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import ReplayIcon from "@material-ui/icons/Replay";
import PlayArrow from "@material-ui/icons/PlayArrow";
import Fab from "@material-ui/core/Fab";

import Utils from "./Utils";

import { withStyles } from "@material-ui/styles";

const styles = {
    Header: {
        margin: 0,
        padding: "30px",
        textAlign: "center",
        color: "#fff",
        fontSize: 50,
        fontWeight: "lighter"
    },
    TableHeader: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "lighter"
    },
    TableCell: {
        color: "#fff",
        fontWeight: "lighter"
    },
    ResetButton: {
        position: "absolute",
        top: "0px",
        left: "0px",
        margin: "30px",
        color: "#fff"
    },
    AudioPlayer: {
        margin: "20px",
        width: "80%"
    }
};

class SummaryScreen extends Component {
    constructor(props) {
        super(props);

        this._audioPlayer = React.createRef();
    }

    render() {
        const { classes, audioUrl } = this.props;
        return (
            <>
                <h2 className={classes.Header}>Summary</h2>
                <ReactAudioPlayer
                    ref={this._audioPlayer}
                    className={classes.AudioPlayer}
                    controls
                    src={audioUrl}
                />
                <Fab
                    color={"primary"}
                    className={classes.ResetButton}
                    aria-label="reset"
                    onClick={this.props.onReset}
                >
                    <ReplayIcon className={classes.RecordingButtonLabel} />
                </Fab>
                <Table>
                    <TableHead className={classes.TableHeader}>
                        <TableRow>
                            <TableCell className={classes.TableHeader} />
                            <TableCell
                                className={classes.TableHeader}
                                align="right"
                            >
                                Type
                            </TableCell>
                            <TableCell
                                align="right"
                                className={classes.TableHeader}
                            >
                                Start Time
                            </TableCell>
                            <TableCell
                                align="right"
                                className={classes.TableHeader}
                            >
                                End Time
                            </TableCell>
                            <TableCell
                                align="right"
                                className={classes.TableHeader}
                            >
                                Duration (s)
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {this.props.annotations &&
                            this.props.annotations.map(annotation => (
                                <TableRow key={annotation.id}>
                                    <TableCell
                                        component="th"
                                        scope="row"
                                        className={classes.TableCell}
                                    >
                                        <Fab
                                            size={"small"}
                                            onClick={() => {
                                                this._onAnnotationPlayed(
                                                    annotation
                                                );
                                            }}
                                        >
                                            <PlayArrow />
                                        </Fab>
                                    </TableCell>
                                    <TableCell
                                        component="th"
                                        scope="row"
                                        align="right"
                                        className={classes.TableCell}
                                    >
                                        {annotation.type}
                                    </TableCell>
                                    <TableCell
                                        align="right"
                                        className={classes.TableCell}
                                    >
                                        {Utils.secondsToTimeString(
                                            annotation.getStartTimeMs() > 0
                                                ? annotation.getStartTimeMs() /
                                                      1000
                                                : 0,
                                            true
                                        )}
                                    </TableCell>
                                    <TableCell
                                        align="right"
                                        className={classes.TableCell}
                                    >
                                        {Utils.secondsToTimeString(
                                            annotation.getEndTimeMs() / 1000,
                                            true
                                        )}
                                    </TableCell>
                                    <TableCell
                                        align="right"
                                        className={classes.TableCell}
                                    >
                                        {annotation.totalDuration / 1000}
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </>
        );
    }

    _onAnnotationPlayed = annotation => {
        if (this._audioPlayer) {
            this._audioPlayer.current.audioEl.currentTime =
                annotation.getStartTimeMs() / 1000;
            this._audioPlayer.current.audioEl.play();
        }
    };
}

export default withStyles(styles)(SummaryScreen);
