import React, { Component, Fragment } from 'react';

import '../cxd.css';
import settingsIcon from "../assets/baseline-settings-20px.svg";
import peopleIcon from "../assets/baseline-people-24px.svg";
import EmoteIcon from "../assets/EmoteIcon";

import EmoteMenu from "./EmoteMenu";

//temp
import adminBadge from "../assets/baseline-build-24px.svg";

class Footer extends Component {
  state = {
    inputText: "",
  }

  constructor() {
    super();

    this.toggleEmotes = this.toggleEmotes.bind(this);
  }

  componentDidMount() {
    this.chatInput.focus();
  }
  
  toggleEmotes() {
    // focus chat input when coming back from emote menu
    if (this.props.emoteMenuVisible) {
      this.chatInput.focus();
    }

    this.props.onEmoteMenuToggle();
  }

  render() {
    return (
      <Fragment>
        <div className="footer">
          <div className="chatBar">
            <input className="chatBarInput" ref={(el) => this.chatInput = el} placeholder="Send a message..."/>
            <button className="iconButton emoteButton" onClick={this.toggleEmotes}>
              <EmoteIcon color={this.props.emoteMenuVisible ? '#FFFFFF' : '#707070'}/>
            </button>
          </div>
          <div className="chatExperience">
            <div className="optionButtons">
              <img className="optionButton" alt="Settings" src={settingsIcon}/>
              <img className="optionButton" alt="Viewer List" src={peopleIcon}/>
            </div>
            <div className="chatUserDisplay">
              <p style={{color: "#ED0000", fontFamily: "Open Sans", margin: 0}}>Phineas</p>
              <img style={{width: 18, marginLeft: 5}} alt="Admin" src={adminBadge}/>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default Footer;