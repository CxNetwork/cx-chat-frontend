import React, { PureComponent } from "react";

export class ChatList extends PureComponent {
  render() {
    return (
      <div className="chat-flex-container" style={{ color: "white" }}>
        {this.props.messages.map(m => {
          return (
            <div>
              {m.username}: {m.content}
            </div>
          );
        })}
      </div>
    );
  }
}
export default ChatList;
