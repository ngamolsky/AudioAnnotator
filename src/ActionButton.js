import React, { Component } from "react";
import { withStyles } from "@material-ui/styles";
import Button from "@material-ui/core/Button";

import red from "@material-ui/core/colors/red";

const styles = {
    ActionButton: {
        height: "60px",
        width: "200px",
        fontSize: 24,
        backgroundColor: red["500"],
        "&:hover": {
            backgroundColor: red["200"]
        },
        color: "#fff",
        fontWeight: "lighter",
        marginTop: "20px",
        marginBottom: "60px"
    }
};

class ActionButton extends Component {
    render() {
        const { classes } = this.props;

        return (
            <Button
                className={classes.ActionButton}
                onClick={() => {
                    this.props.onAnnotationButtonClicked(this.props.name);
                }}
            >
                {this.props.name}
            </Button>
        );
    }
}

export default withStyles(styles)(ActionButton);
