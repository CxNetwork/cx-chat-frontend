import React, { Component } from 'react';
import './cxd.css';

import Header from "./components/Header";
import Footer from "./components/Footer";

class App extends Component {
  render() {
    return (
      <div className="cxChat">
        <Header/>
        <Footer/>
      </div>
    );
  }
}

export default App;
