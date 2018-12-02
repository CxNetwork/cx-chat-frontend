import React, { Component } from 'react';
import './cxd.css';

import Chat from "./components/Chat";

class App extends Component {
  render() {
    return (
      <div className="cxChat">
        <Chat />
      </div>
    );
  }
}

export default App;
