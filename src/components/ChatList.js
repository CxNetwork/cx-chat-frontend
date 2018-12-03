import React, { PureComponent } from "react";
import { Twemoji } from 'react-emoji-render';

export class ChatList extends PureComponent {
  render() {
    return (
      <div className="chat-flex-container" style={{ color: "white" }}>
        {this.props.messages.map(m => {
          return (
            <div className="chat-list-item">
              <Twemoji style={{color: m.color, fontWeight: 600}} text={m.username} />
              <span>: {m.content}</span>
            </div>
          );
        })}
      </div>
    );
  }
}
export default ChatList;
