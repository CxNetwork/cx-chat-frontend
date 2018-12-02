import React, { Component } from 'react';

import '../cxd.css';
import settingsIcon from "../assets/baseline-settings-20px.svg";
import peopleIcon from "../assets/baseline-people-24px.svg";

//temp
import adminBadge from "../assets/baseline-build-24px.svg";

class Footer extends Component {
  state = {
    inputText: ""
  }
  render() {
    return (
      <div className="footer">
        <div className="chatBar">
          <input className="chatBarInput" placeholder="Send a message..."/>
        </div>
        <div className="chatExperience">
          <div className="optionButtons">
            <img className="optionButton" src={settingsIcon}/>
            <img className="optionButton" src={peopleIcon}/>
          </div>
          <div className="chatUserDisplay">
            <p style={{color: "#ED0000", fontFamily: "Open Sans", margin: 0}}>Phineas</p>
            <img style={{width: 18, marginLeft: 5}} src={adminBadge}/>
          </div>
        </div>
      </div>
    );
  }
}

export default Footer;