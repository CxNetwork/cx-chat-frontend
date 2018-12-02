import React, { Component } from "react";

import "./chat.css";
import Footer from "./components/Footer";
import ChatList from "./components/ChatList";
import cxLogo from "./assets/cxlogo.svg";
import launchIcon from "./assets/baseline-launch-24px.svg";

const usernames = [
  "Magnaboy",
  "Phineas",
  "Ciaran",
  "Segfault",
  "Coggins",
  "Ice_Poseidon"
];

class App extends Component {
  state = {
    showEmoteMenu: false,
    messages: [],
    maxMessages: 10,
  };

  componentDidMount() {
    setInterval(this.addRandomChatMessage, 500);
  }

  emoteMenuToggle = () => {
    this.setState({ showEmoteMenu: !this.state.showEmoteMenu });
  };

  addRandomChatMessage = () => {
    const message = {
      username: usernames[Math.floor(Math.random() * usernames.length)],
      content: Math.floor(Math.random() * 1000)
    };

    let currMessages = this.state.messages;

    if (this.state.messages.length > this.state.maxMessages) {
      currMessages.shift();
    }

    currMessages = [...currMessages, message]

    this.setState({ messages: currMessages });
  };

  render() {
    return (
      <div className="flex-container">
        <div className="header">
          <img style={{ width: 25, marginLeft: 15 }} src={cxLogo} />
          <p className="streamerHeaderName">Ice Poseidon</p>
          <img
            style={{ marginLeft: "auto", marginRight: 15 }}
            src={launchIcon}
          />
        </div>

        <div style={{ padding: 20 }}>
          <ChatList messages={this.state.messages} />
        </div>

        <Footer
          emoteMenuToggle={this.emoteMenuToggle}
          emotesVisible={this.state.showEmoteMenu}
        />
      </div>
    );
  }
}

export default App;
