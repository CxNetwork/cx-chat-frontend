import React, {Fragment, Component} from "react";

import EmoteMenu from "./EmoteMenu";
import Footer from "./Footer";
import ChatList from "./ChatList";
import cxLogo from "../assets/cxlogo.svg";
import launchIcon from "../assets/baseline-launch-24px.svg";

const usernames = [
  "Magnaboy",
  "Phineas",
  "Ciaran",
  "Segfault",
  "Coggins",
  "Ice_Poseidon",
  "TTD_FAGGOT_420"
];

const colors = [
  "#fff3aa",
  "#ffd0a8",
  "#ffb1b1",
  "#d9d1ff",
  "#b7efff",
]

function generateColorFromString(str) {
  let sum = 0;
  for (let x = 0; x < str.length; x++) sum += x * str.charCodeAt(x);
  return colors[sum%colors.length];
}

class Chat extends Component {
  state = {
    emoteMenuVisible: false,
    messages: [],
    maxMessages: 10,
  }

  setEmoteMenuVisible(visible) {
    this.setState({ emoteMenuVisible: visible });
  }

  componentDidMount() {
    setInterval(this.addRandomChatMessage, 500);
  }
  
  addRandomChatMessage = () => {
    const username = usernames[Math.floor(Math.random() * usernames.length)];

    const message = {
      username: username,
      color: generateColorFromString(username),
      content: Math.floor(Math.random() * 1000)
    };

    if (username.toLowerCase().indexOf("ttd") !== -1) {
      message.color = "#7b5804";
      message.username = "💩" + message.username;
    }

    let currMessages = this.state.messages;

    if (this.state.messages.length > this.state.maxMessages) {
      currMessages.shift();
    }

    currMessages = [...currMessages, message]

    this.setState({ messages: currMessages });
  };

  render() {
    return (
      <Fragment>
        <div className="header">
          <img style={{ width: 25, marginLeft: 15 }} alt="Cx Logo" src={cxLogo} />
          <p className="streamerHeaderName">Ice Poseidon</p>
          <img
            style={{ marginLeft: "auto", marginRight: 15 }}
            src={launchIcon}
            alt="Pop out"
          />
        </div>

        {/* Chat Area */}    
        <div>
          <ChatList messages={this.state.messages} />
          {this.state.emoteMenuVisible ?
            <EmoteMenu onClose={() => this.setEmoteMenuVisible(false)}/> :
            null
          }
        </div>

        <Footer
          emoteMenuVisible={this.state.emoteMenuVisible}
          onEmoteMenuToggle={() => this.setEmoteMenuVisible(!this.state.emoteMenuVisible) }
        />
      </Fragment>
    );
  }
};

export default Chat;