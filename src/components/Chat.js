import React, {Fragment, Component} from "react";

import EmoteMenu from "./EmoteMenu";
import Header from "./Header";
import Footer from "./Footer";
import MessageList from "./MessageList";

class Chat extends Component {
  state = {
    emoteMenuVisible: false
  }

  setEmoteMenuVisible(visible) {
    this.setState({ emoteMenuVisible: visible });
  }

  render() {
    return (
      <Fragment>
        <Header/>

        {/* Chat Area */}    
        <div>
          <MessageList/>
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