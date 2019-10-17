import React, { Component } from "react";
import { withStyles } from "@material-ui/styles";
import { Badge, Button } from "@material-ui/core";

const styles = theme => {
    return {
        ActionButton: {
            height: "60px",
            width: "200px",
            fontSize: 24,
            fontWeight: "lighter"
        },
        Badge: {
            margin: theme.spacing(2)
        }
    };
};

class ActionButton extends Component {
    render() {
        const { classes, annotationCount } = this.props;
        return (
            <Badge
                color="primary"
                badgeContent={annotationCount}
                className={classes.Badge}
            >
                <Button
                    color="primary"
                    variant="contained"
                    className={classes.ActionButton}
                    onClick={() => {
                        this.props.onAnnotationButtonClicked(this.props.name);
                    }}
                    disabled={this.props.disabled}
                >
                    {this.props.name}
                </Button>
            </Badge>
        );
    }
}

export default withStyles(styles)(ActionButton);
