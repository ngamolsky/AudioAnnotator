import React, { Component } from "react";

export default class Timeline extends Component {
    render() {
        return <audio className="Timeline" src={this.props.src} controls />;
    }
}
