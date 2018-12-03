import React, { PureComponent } from "react";
import { Twemoji } from 'react-emoji-render';
import "../chat.css";

export class ChatList extends PureComponent {
  renderTokens(tokens) {
    return tokens.map(token => {
      switch (token.type) {
        case "EMOTE":
          const base = <img className="emote" src={this.props.emotes[token.name].img} alt={token.name}></img>;
          
          // Return base if no modifiers
          if (token.modifiers.length < 1) return base;

          // Stack modifiers on top
          return (
            <span class="emote-stacked-container">
              {base}
              {token.modifiers.map(x => <img className="emote emote-modifier" src={this.props.modifiers[x].img} alt={x}></img>)}
            </span>
          );

        case "TEXT":
          return <span>{token.value}</span>;

        default:
          return null
      }
    });
  }
  
  render() {
    return (
      <div className="chat-flex-container" style={{ color: "white" }}>
        {this.props.messages.map(m => {
          return (
            <div className="chat-list-item">
              <Twemoji style={{color: m.color, fontWeight: 600}} text={m.username} />
              <span>: {this.renderTokens(m.content)}</span>
            </div>
          );
        })}
      </div>
    );
  }
}

export default ChatList;
