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

const emotes = {
  "TriHard": { img: "https://static-cdn.jtvnw.net/emoticons/v1/120232/2.0" },
  "Kappa": { img: "https://static-cdn.jtvnw.net/emoticons/v1/25/2.0" },
  "PogChamp": { img: "https://static-cdn.jtvnw.net/emoticons/v1/88/2.0" },
};
const emoteNames = Object.keys(emotes);

const modifiers = {
  "stab": { img: "https://cdn.frankerfacez.com/emoticon/59847/2" },
};
const modifierNames = Object.keys(modifiers);

class Chat extends Component {
  state = {
    emoteMenuVisible: false,
    messages: [],
    maxMessages: 100,
    sampleWords: [],

    emotes,
    modifiers
  }

  setEmoteMenuVisible(visible) {
    this.setState({ emoteMenuVisible: visible });
  }

  componentDidMount() {
    fetch('https://baconipsum.com/api/?type=meat-and-filler').then(res => {
      res.json().then((data) => {
        const split = data.map(x => x.split(/ /g)).reduce((a, b) => [...a, b]);
        this.setState({ sampleWords: split });
        console.log(split);
        setInterval(this.addRandomChatMessage, 500);
      })
    })
  }
  
  tokenize(text) {
    const words = text.split(/ /g);
    const tokens = [];

    let currentText = "";

    const purgeTextBuffer = () => {
      if (currentText.length === 0) return;

      // Save current text onto token list and clear buffer
      tokens.push({ type: "TEXT", value: currentText });
      currentText = "";
    }

    for (const word of words) {
      const wordLen = word.length;
      const sepIndex = word.indexOf(':');
      
      let emote = word;
      let modifiers = "";
      if (sepIndex > -1 && sepIndex < wordLen-1) {
        emote = word.substr(0, sepIndex);
        modifiers = word.substr(sepIndex+1);
      }

      if (emoteNames.indexOf(emote) > -1) {
        // Purge any text in the buffer before writing emote
        purgeTextBuffer();
        currentText = " ";

        // Take our modifiers, validate them against the list and take max 4
        const validModifiers = modifiers.split(':').filter(x => modifierNames.indexOf(x) > -1).slice(0, 4);

        // Put emote onto token list
        tokens.push({ type: "EMOTE", name: emote, modifiers: validModifiers });
      } else {
        // It's just text, add to text buffer
        currentText += word + " ";
      }
    }

    purgeTextBuffer();

    return tokens;
  }

  addRandomChatMessage = () => {
    const username = usernames[Math.floor(Math.random() * usernames.length)];

    const words = [];
    for (let i = 0; i < Math.random() * 20; i++) {
      const modifiers = [];

      if (Math.random() > 0.9) {
        modifiers.push("stab");
      }

      if (Math.random() > 0.8) {
        words.push(`${emoteNames[Math.floor(Math.random() * emoteNames.length)]}${modifiers.length > 0 ? ':' : ''}${modifiers.join(':')}`);
      } else {
        words.push(this.state.sampleWords[Math.floor(Math.random() * this.state.sampleWords.length)]);
      }
    }

    const message = {
      username: username,
      color: generateColorFromString(username),
      content: this.tokenize(words.join(" "))
    };

    console.log(message);

    if (username.toLowerCase().indexOf("ttd") !== -1) {
      message.color = "#7b5804";
      message.username = "💩 " + message.username;
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
          <ChatList messages={this.state.messages}
            emotes={this.state.emotes}
            modifiers={this.state.modifiers} />
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