import React, { Component } from 'react';
import { NimblePicker } from 'emoji-mart';
import "emoji-mart/css/emoji-mart.css";
import twitterData from "emoji-mart/data/twitter.json";
import "../cxemote.css";

class EmoteMenu extends Component {
  state = {
    filterText: ""
  }

  componentDidMount() {
    document.addEventListener("mouseup", this.handleMouseClick);
  }

  componentWillUnmount() {
    document.removeEventListener("mouseup", this.handleMouseClick);
  }

  handleMouseClick = e => {
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
          <NimblePicker set="twitter" data={twitterData} title="Its just a monkey" emoji="monkey" />
        </div>
      </span>
    );
  }
};

export default EmoteMenu;
