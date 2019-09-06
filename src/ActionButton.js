import React, { Component } from "react";
import "./App.css";

class ActionButton extends Component {
    render() {
        return <button className="ActionButton">{this.props.name}</button>;
    }
}

export default ActionButton;
