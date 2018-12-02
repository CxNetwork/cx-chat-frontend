import React, { Component } from 'react';
import { Picker } from 'emoji-mart';
import "emoji-mart/css/emoji-mart.css";
import "../cxemote.css";

class EmoteMenu extends Component {
  state = {
    filterText: ""
  }

  componentDidMount() {
//    this.filterInput.focus();
  }

  render() {
    return (
      <div className="emoteMenuRoot">
        {/*<h1>Hi</h1>
        <input ref={(el) => this.filterInput = el}></input>*/}
        <Picker set="twitter" />
      </div>
    );
  }
};

export default EmoteMenu;