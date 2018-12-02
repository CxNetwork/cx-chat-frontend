import React, { Component } from 'react';

class EmoteMenu extends Component {
  state = {
    filterText: ""
  }

  componentDidMount() {
    this.filterInput.focus();
  }

  render() {
    return (
      <div className="emoteMenuRoot">
        <h1>Hi</h1>
        <input ref={(el) => this.filterInput = el}></input>
      </div>
    );
  }
};

export default EmoteMenu;
