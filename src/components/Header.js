import React, { Component } from 'react';

import cxLogo from "../assets/cxlogo.svg"
import launchIcon from "../assets/baseline-launch-24px.svg";
import '../cxd.css';

class Header extends Component {
  render() {
    return (
      <div className="header">
        <img style={{width:25, marginLeft: 15}} src={cxLogo}/>
        <p className="streamerHeaderName">Ice Poseidon</p>
        <img style={{marginLeft: "auto", marginRight: 15}} src={launchIcon}/>
      </div>
    );
  }
}

export default Header;