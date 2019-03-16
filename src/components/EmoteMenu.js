import React, { Component } from "react";
import { NimblePicker } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";
import twitterData from "emoji-mart/data/twitter.json";
import "../cxemote.css";

class EmoteMenu extends Component {
	state = {
		filterText: ""
	};

	componentDidMount() {
		document.addEventListener("mouseup", this.handleMouseClick);
	}

	componentWillUnmount() {
		document.removeEventListener("mouseup", this.handleMouseClick);
	}

	handleMouseClick = e => {
		if (!this.rootRef) return;

		if (!this.rootRef.contains(e.target)) {
			setImmediate(this.props.onClose);
		}
	};

	onEmojiSelected = emoji => {
		// Select text to type - if it is custom type the id, otherwise type emoji.
		const text = emoji.custom ? emoji.id : emoji.native;

		this.props.onEmojiSelected(text);
	};

	render() {
		const customEmotes = Object.entries(this.props.emotes.emojiMappings).map(
			([name, imageUrl]) => ({
				key: name,
				name,
				imageUrl,
				text: name,
				short_names: [name],
				keywords: [name]
			})
		);

		return (
			<span ref={el => (this.rootRef = el)}>
				<div className="emoteMenuRoot">
					{/*<h1>Hi</h1>
          <input ref={(el) => this.filterInput = el}></input>*/}
					<NimblePicker
						set="twitter"
						custom={customEmotes}
						onSelect={this.onEmojiSelected}
						data={twitterData}
						title="Its just a monkey"
						emoji="monkey"
					/>
				</div>
			</span>
		);
	}
}

export default EmoteMenu;
