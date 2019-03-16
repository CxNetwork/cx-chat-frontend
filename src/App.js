import React, { Component, Fragment } from "react";
import stripCombiningMarks from "strip-combining-marks";
import firebase from "@firebase/app";

import laugh from "./assets/laugh.ogg";
import Chat from "./components/Chat";
import GeneralSettings from "./components/GeneralSettings";
import ModeratorSettings from "./components/ModeratorSettings";
import AdminSettings from "./components/AdminSettings";

import AutoCompleteService from "./services/AutoCompleteService";

import { auth } from "./firebase";
import { loadState, saveState, validateMessage, isModerator } from "./util";

const provider = new firebase.auth.GoogleAuthProvider();

const audio = new Audio(laugh);

class App extends Component {
	state = {
		authenticated: false,
		token: "",
		gateway: "",
		emotes: {},
		user: { state: "none" },
		errors: {},
		lastMessage: null,
		isBanned: false,
		messages: [],
		maxMessages: loadState("messageBufferSize") || 80,
		cooldown: false,
		chatFontSize: loadState("chatFontSize") || 15,
		openedModal: null,
		youtubeHidden: loadState("youtubeHidden") || false,
		mentionSoundsDisabled: loadState("mentionSoundsDisabled") || false
	};

	autoCompleteService = new AutoCompleteService();

	removeMessages = username => {
		this.setState({
			messages: this.state.messages.filter(msg => msg.username !== username)
		});
	};

	addChatMessage = message => {
		let { messages, maxMessages } = this.state;
		if (messages.push(message) === maxMessages + 1) messages.shift();
		this.setState({ messages });
	};

	toggleModal = key => {
		if (!key) return this.setState({ openedModal: null });
		if (!["generalSettings", "adminSettings", "moderatorSettings"].includes(key)) return;
		this.setState({ openedModal: key });
	};

	componentDidMount() {
		this.chat = React.createRef();

		this.autoCompleteService.init();

		auth.onAuthStateChanged(authUser => {
			if (authUser) {
				auth.currentUser.getIdToken(false).then(token => {
					this.setState({ token });
					this._requestInitData();
				});
			} else {
				this._requestInitData();
				this.setState({ authenticated: false });
			}
		});

		firebase.auth().onIdTokenChanged(user => {
			if (user) {
				user.getIdToken(false).then(token => {
					this.setState({ token });
				});
			}
		});
	}

	_handleLoginAttempt() {
		firebase
			.auth()
			.signInWithPopup(provider)
			.then(console.log)
			.catch(console.error);
	}

	_handleLogout() {
		firebase
			.auth()
			.signOut()
			.then(() => {
				console.log("[CxChat:Auth] Logged out successfully.");
				window.location.reload();
			});
	}

	_requestInitData() {
		fetch("https://api-production.iceposeidon.com/chat/init", {
			method: "GET",
			headers: {
				Accept: "application/json",
				authorization: this.state.token
			}
		})
			.then(res => res.json())
			.then(data => {
				const { user, emotes, gateway, accessToken } = data.data;
				if (accessToken) {
					localStorage.setItem("socketCluster.authToken", accessToken);
					if (this.socket) this.socket.authenticate(accessToken, console.log());
				}

				emotes.emoteNames = Object.keys(emotes.emojiMappings);
				emotes.modifierNames = Object.keys(emotes.modifiers);

				this.autoCompleteService.setEmotes(emotes.emojiMappings);

				this.setState({ user, emotes, gateway });
				this.updateBanStatus();
				this._establishGateway(gateway);
			});
	}

	_establishGateway(host) {
		if (this.socket) return; // Don't establish the socket more than once!
		var socket = window.socketCluster.create({
			hostname: "chat-gateway-dev.iceposeidon.com",
			secure: true,
			port: 443
		});
		this.socket = socket;
		const chatChannel = socket.subscribe("yell");

		socket.on("connect", function() {
			console.log("CONNECTED");
		});

		socket.on("raw", data => {
			try {
				const parsed = JSON.parse(data);
				if (parsed.t && parsed.t === "rotateToken") {
					this._requestInitData();
				}
			} catch (e) {
				console.error(e);
			}
		});

		socket.on("authStateChange", state => {
			if (state.newState === "unauthenticated") {
				this._requestInitData();
			}
		});

		chatChannel.watch(data => {
			try {
				switch (data.t) {
					case "ccm": // common chat message
						if (data.u === this.state.user.username) return;
						if (!data.b) data.b = [];
						this.chat.current.addChatMessage(data);
						break;

					case "ytc":
						this.chat.current.addYTMessage(data);
						break;

					case "pms":
						this.removeMessages(data.u);
						console.log(`${data.u} was banned.`);
						if (data.u !== this.state.user.username) return;
						this._requestInitData();
					// fall through and reload data
					case "cf":
						//chat features
						let emotes = this.state.emotes;
						emotes.features.sponsorMode = data.sponsorMode;
						this.setState({ emotes });
						break;
					case "tr":
						this._requestInitData();
						break;

					default:
						break;
				}
			} catch (e) {
				console.error(e);
			}
		});
	}

	_submitChatMessage = msg => {
		const { isBanned, cooldown, user, lastMessage } = this.state;
		if (isBanned) return;

		// Client-side cooldown mechanism to prevent mass-spam
		// 400ms slowmode for non-mods
		if (!isModerator(this.state.user)) {
			if (cooldown) return;
			this.setState({ cooldown: true });
			setTimeout(() => this.setState({ cooldown: false }), 400);

			// Clean out combining marks into normal text, and trim it
			msg = stripCombiningMarks(msg.trim());

			// Check if its valid, if not - reject and play EBZ laugh
			if (validateMessage(msg)) return audio.play();

			// No duplicate messages
			if (lastMessage === msg) return true;
			this.setState({ lastMessage: msg });
		}
		// Send the mesage
		this.chat.current.addChatMessage({
			t: "ccm",
			u: user.username,
			c: msg,
			b: user.badges
		});

		this.socket.emit("chat", JSON.stringify({ c: msg }));
	};

	updateBanStatus = () => {
		if (this.banTimeout) {
			clearTimeout(this.banTimeout);
			this.banTimeout = null;
		}
		if (this.state.user.state !== "complete") return this.setState({ isBanned: false });
		if (!this.state.user.punishments || this.state.user.punishments.length === 0)
			return this.setState({ isBanned: false });

		const punishment = this.state.user.punishments[0];
		console.log(punishment);

		switch (punishment.punishData) {
			case "permaban":
				return this.setState({ isBanned: true });

			case "timeout":
				const stillValid = punishment["end"] > Math.floor(Date.now() / 1000);
				if (stillValid) {
					this.banTimeout = setTimeout(
						this.updateBanStatus,
						(punishment["end"] - Math.floor(Date.now() / 1000)) * 1000
					);
				}

				return this.setState({ isBanned: stillValid });

			default:
				return this.setState({ isBanned: true });
		}
	};

	_submitUsername = username => {
		fetch("https://api-production.iceposeidon.com/chat/username", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				authorization: this.state.token
			},
			body: JSON.stringify({
				username
			})
		})
			.then(res => res.json())
			.then(data => {
				if (data.success) {
					const { user } = data.data;
					this.setState({ user });
					this._requestInitData();
				} else {
					let ne = this.state.errors;
					ne["username"] = data.error;
					this.setState({ errors: ne });
				}
			});
	};

	setChatFontSize = size => {
		this.setState({ chatFontSize: size });
	};

	setMessageBuffer = size => {
		const newSize = Math.min(size, 250);
		this.setState({ messages: this.state.messages.slice(0, newSize) });
		this.setState({ maxMessages: Math.min(size, 250) });
	};

	toggleYoutubeHidden = () => {
		saveState("youtubeHidden", !this.state.youtubeHidden);
		this.setState({ youtubeHidden: !this.state.youtubeHidden });
	};

	toggleMentionSounds = () => {
		saveState("mentionSoundsDisabled", !this.state.mentionSoundsDisabled);
		this.setState({ mentionSoundsDisabled: !this.state.mentionSoundsDisabled });
	};

	render() {
		return (
			<Fragment>
				<GeneralSettings
					user={this.state.user}
					youtubeHidden={this.state.youtubeHidden}
					toggleYoutubeHidden={this.toggleYoutubeHidden}
					mentionSoundsDisabled={this.state.mentionSoundsDisabled}
					toggleMentionSounds={this.toggleMentionSounds}
					toggleModal={this.toggleModal}
					chatFontSize={this.state.chatFontSize}
					setChatFontSize={this.setChatFontSize}
					messageBuffer={this.state.maxMessages}
					setMessageBuffer={this.setMessageBuffer}
					isOpen={this.state.openedModal === "generalSettings"}
					_logout={this._handleLogout}
				/>
				<ModeratorSettings
					user={this.state.user}
                                        token={this.state.token}
					toggleModal={this.toggleModal}
					chatFontSize={this.state.chatFontSize}
					setChatFontSize={this.setChatFontSize}
					isOpen={this.state.openedModal === "moderatorSettings"}
				/>
				<AdminSettings
					user={this.state.user}
					toggleModal={this.toggleModal}
					chatFontSize={this.state.chatFontSize}
					setChatFontSize={this.setChatFontSize}
					token={this.state.token}
					features={this.state.emotes.features || { sponsorMode: false }}
					isOpen={this.state.openedModal === "adminSettings"}
				/>
				<div className="flex-container">
					<Chat
						autoCompleteService={this.autoCompleteService}
						youtubeHidden={this.state.youtubeHidden}
						mentionSoundsDisabled={this.state.mentionSoundsDisabled}
						chatFontSize={this.state.chatFontSize}
						setChatFontSize={this.setChatFontSize}
						toggleModal={this.toggleModal}
						ref={this.chat}
						errors={this.state.errors}
						authenticated={this.state.authenticated}
						user={this.state.user}
						token={this.state.token}
						emotes={this.state.emotes}
						addChatMessage={this.addChatMessage}
						messages={this.state.messages}
						maxMessages={this.state.maxMessages}
						isBanned={this.state.isBanned}
						_attemptLogin={this._handleLoginAttempt}
						_submitChatMessage={this._submitChatMessage}
						_requestUsername={this._submitUsername}
					/>
				</div>
			</Fragment>
		);
	}
}

export default App;
