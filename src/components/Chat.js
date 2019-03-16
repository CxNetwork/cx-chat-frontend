import React, { Fragment, Component } from "react";
import KeyHandler, { KEYDOWN, KEYUP } from "react-key-handler";

import EmoteMenu from "./EmoteMenu";
import Footer from "./Footer";
import ChatList from "./ChatList";
import Debug from "./Debug";
import cxLogo from "../assets/cxlogo.svg";
import launchIcon from "../assets/baseline-launch-24px.svg";
import click from "../assets/click.ogg";
const mentionSound = new Audio(click);

const colors = ["#fff3aa", "#ffd0a8", "#ffb1b1", "#d9d1ff", "#b7efff"];

const allowedHosts = [
	/^(.*\.)?reddit\.(com|co\.uk)$/i,
	/^(.*\.)?iceposeidon\.com$/i,
	/^(.*\.)?youtube\.com$/i,
	/^(.*\.)?youtu\.be$/i,
	/^(.*\.)?discordapp\.com$/i,
	/^(.*\.)?twitter\.com$/i
];

function generateColorFromString(str) {
	let sum = 0;
	for (let x = 0; x < str.length; x++) sum += x * str.charCodeAt(x);
	return colors[sum % colors.length];
}

class Chat extends Component {
	state = {
		emoteMenuVisible: false,
		contextMenuVisible: false,
		messagesPaused: false
	};

	messageId = 0;
	footer = React.createRef();
	lastNotifiedTime = -1000;

	ctrlDown = e => {
		if (
			this.props.user.badges &&
			(this.props.user.badges.includes("admin") ||
				this.props.user.badges.includes("globalmod"))
		) {
			e.preventDefault();
			this.setState({ messagesPaused: true });
		}
		return;
	};

	ctrlUp = e => {
		if (
			this.props.user.badges &&
			(this.props.user.badges.includes("admin") ||
				this.props.user.badges.includes("globalmod"))
		) {
			e.preventDefault();
			if (!this.state.contextMenuVisible) this.setState({ messagesPaused: false });
		}
	};

	handleModContextMenuOpen = () => {
		this.setState({ messagesPaused: true, contextMenuVisible: true });
	};

	handleModContextMenuClose = () => {
		this.setState({ messagesPaused: false, contextMenuVisible: false });
	};

	handleModContextMenuClick = (e, data) => {
		console.log("timing out " + data.username + "for " + data.time + " minutes");
	};

	setEmoteMenuVisible(visible) {
		this.setState({ emoteMenuVisible: visible });
	}

	onEmoteSelected = emoteText => {
		this.footer.current.insertText(`${emoteText} `);
	};

	tokenize(text, badges) {
		const words = text.split(/ /g);
		const tokens = [];

		let currentText = "";

		const purgeTextBuffer = startSpace => {
			// Save current text onto token list and clear buffer
			tokens.push({ type: "TEXT", value: currentText });
			currentText = startSpace ? " " : "";
		};

		for (const word of words) {
			const wordLen = word.length;
			const sepIndex = word.indexOf(":");

			if (word.startsWith("https://") || word.startsWith("http://")) {
				try {
					const parsedURL = new URL(word);

					if (
						this.validateURL(parsedURL) ||
						(badges && (badges.includes("admin") || badges.includes("globalmod")))
					) {
						purgeTextBuffer(true);
						tokens.push({ type: "LINK", url: parsedURL });
					}

					// TODO: do we want to just bin the URL off if it isn't allowed by the filter?
					continue;
				} catch (ex) {
					// not a URL! fall through
				}
			}

			const withoutPunctuation = word.replace(/[.,!$%&;:-]/g, "");
			if (
				this.props.user.state === "complete" &&
				(withoutPunctuation.toLowerCase() === this.props.user.username.toLowerCase() ||
					(withoutPunctuation.length > 1 &&
						withoutPunctuation[0] === "@" &&
						withoutPunctuation.substr(1, word.length - 1).toLowerCase() ===
							this.props.user.username.toLowerCase()))
			) {
				// Purge text buf
				purgeTextBuffer(true);

				tokens.push({ type: "HIGHLIGHT", value: `${word}` });
				this.onMentioned();

				continue;
			}

			let emote = word;
			let modifiers = "";
			if (sepIndex > -1 && sepIndex < wordLen - 1) {
				emote = word.substr(0, sepIndex);
				modifiers = word.substr(sepIndex + 1);
			}

			if (this.props.emotes.emoteNames.indexOf(emote) > -1) {
				// Purge any text in the buffer before writing emote
				purgeTextBuffer(true);

				// Take our modifiers, validate them against the list and take max 4
				const validModifiers = modifiers
					.split(":")
					.filter(x => this.props.emotes.modifierNames.indexOf(x) > -1)
					.slice(0, 4);

				// Put emote onto token list
				tokens.push({
					type: "EMOTE",
					name: emote,
					modifiers: validModifiers,
					textRepresentation: `${emote}${
						validModifiers.length > 0 ? ":" : ""
					}${validModifiers.join(":")}`
				});
			} else {
				// It's just text, add to text buffer
				currentText += word + " ";
			}
		}

		purgeTextBuffer();

		return tokens;
	}

	onMentioned = () => {
		if (Date.now() - this.lastNotifiedTime < 1000) return;
		this.lastNotifiedTime = Date.now();

		// Play mention sound unless user has opted-out
		console.log(this.props.mentionSounds);
		if (!this.props.mentionSoundsDisabled) mentionSound.play();
	};

	addChatMessage = data => {
		const color =
			data.b.length > 0
				? this.props.emotes.badges[data.b[0]].nameColor
				: generateColorFromString(data.u);

		if (this.props.emotes.emojiMappings) {
			const message = {
				username: data.u,
				color,
				content: this.tokenize(data.c, data.b),
				badges: data.b,
				key: this.messageId++
			};

			this.props.autoCompleteService.addUser(data.u, { badges: data.b });

			if (!this.state.messagesPaused) this.props.addChatMessage(message);
		}
	};

	validateURL = url => {
		// For now, just check our host list
		return allowedHosts.find(regex => regex.test(url.host));
	};

	addYTMessage = data => {
		if (!this.props.youtubeHidden && !this.state.messagesPaused) {
			this.props.addChatMessage({
				username: `(YT) ${data.u}`,
				color: "#797979",
				content: [{ type: "YOUTUBE_MESSAGE", content: data.c }],
				badges: [],
				key: this.messageId++
			});
		}
	};

	render() {
		return (
			<Fragment>
				<KeyHandler keyEventName={KEYDOWN} keyValue="Control" onKeyHandle={this.ctrlDown} />
				<KeyHandler keyEventName={KEYUP} keyValue="Control" onKeyHandle={this.ctrlUp} />

				<Debug
					chatFontSize={this.props.chatFontSize}
					setChatFontSize={this.props.setChatFontSize}
					addMsg={this.addChatMessage}
				/>
				<div className="header">
					<img style={{ width: 25, marginLeft: 15 }} alt="Cx Logo" src={cxLogo} />
					<p className="streamerHeaderName">Ice Poseidon</p>
					<img
						style={{ marginLeft: "auto", marginRight: 15 }}
						src={launchIcon}
						onClick={() =>
							window.open(
								"https://chat.iceposeidon.com/?popped_out=1",
								"cxchat",
								"height=1000,width=500"
							)
						}
						alt="Pop out"
					/>
				</div>

				{/* Chat Area */}
				<div className="chat-area-container">
					<ChatList
						handleModContextMenuOpen={this.handleModContextMenuOpen}
						handleModContextMenuClose={this.handleModContextMenuClose}
						handleModContextMenuClick={this.handleModContextMenuClick}
						chatFontSize={this.props.chatFontSize}
						messages={this.props.messages}
						emotes={this.props.emotes}
						token={this.props.token}
						user={this.props.user}
						onMention={username => {
							this.footer.current.insertText(`@${username} `);
							this.footer.current.focusChatInput();
						}}
					/>
					{this.state.emoteMenuVisible ? (
						<EmoteMenu
							emotes={this.props.emotes}
							onEmojiSelected={this.onEmoteSelected}
							onClose={() => this.setEmoteMenuVisible(false)}
						/>
					) : null}
				</div>

				<Footer
					autoCompleteService={this.props.autoCompleteService}
					toggleModal={this.props.toggleModal}
					emoteMenuVisible={this.state.emoteMenuVisible}
					authenticated={this.props.authenticated}
					user={this.props.user}
					emotes={this.props.emotes}
					errors={this.props.errors}
					ref={this.footer}
					_attemptLogin={this.props._attemptLogin}
					generateColorFromString={generateColorFromString}
					_submitChatMessage={this.props._submitChatMessage}
					_requestUsername={this.props._requestUsername}
					isBanned={this.props.isBanned}
					onEmoteMenuToggle={() => this.setEmoteMenuVisible(!this.state.emoteMenuVisible)}
				/>
			</Fragment>
		);
	}
}

export default Chat;
