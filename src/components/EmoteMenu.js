import React, { Component } from 'react';
import { Picker } from 'emoji-mart';
import "emoji-mart/css/emoji-mart.css";
import "../cxemote.css";

class EmoteMenu extends Component {
  state = {
    filterText: ""
  }

  constructor() {
    super();

    this.handleMouseClick = this.handleMouseClick.bind(this);
  }

  componentDidMount() {
    document.addEventListener("mousedown", this.handleMouseClick);
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleMouseClick);
  }

  handleMouseClick(e) {
    if (!this.rootRef) return;
    
    if (!this.rootRef.contains(e.target)) {
      setImmediate(this.props.onClose);
    }
  }

  render() {
    return (
      <span ref={el => this.rootRef = el }>
        <div className="emoteMenuRoot">
          {/*<h1>Hi</h1>
          <input ref={(el) => this.filterInput = el}></input>*/}
          <Picker set="twitter" />
        </div>
      </span>
    );
  }
};

export default EmoteMenu;