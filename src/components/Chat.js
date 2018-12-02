import React, {Fragment, Component} from "react";

import EmoteMenu from "./EmoteMenu";
import Header from "./Header";
import Footer from "./Footer";
import MessageList from "./MessageList";

class Chat extends Component {
  state = {
    emoteMenuVisible: false
  }

  render() {
    return (
      <Fragment>
        <Header/>

        {/* Chat Area */}    
        <div>
          <MessageList/>
          {this.state.emoteMenuVisible ? <EmoteMenu/> : null}
        </div>

        <Footer
          emoteMenuVisible={this.state.emoteMenuVisible}
          onEmoteMenuToggle={() => this.setState({ emoteMenuVisible: !this.state.emoteMenuVisible })}
        />
      </Fragment>
    );
  }
};

export default Chat;