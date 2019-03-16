import React, { Component, Fragment } from "react";
import Button from "@material/react-button";
import Countdown from "react-countdown-now";

import settingsIcon from "../assets/baseline-settings-20px.svg";
import modIcon from "../assets/baseline-security-24px.svg";
import adminIcon from "../assets/baseline-code-24px.svg";
import EmoteIcon from "../assets/EmoteIcon";
import "@material/react-button/dist/button.css";

const AutoCompleteItems = ({ tabCompleteSubjects, tabCompletePtr, badges }) =>
	tabCompleteSubjects.length === 0 ? (
		<span style={{color: '#FFFFFF'}}>Nothing here</span>
	) : (
		tabCompleteSubjects.map((x, i) => {
			switch (x.type) {
				case "emote":
					return (
						<div key={i} style={{ backgroundColor: i === tabCompletePtr ? "#6200ee" : "" }}>
							<img className="autocomplete-preview-img" alt="" src={x.url} />
							{x.value}
						</div>
					);
				case "user":
					const badgeURL = x.data.badges.length !== 0 ? badges[x.data.badges[0]].image : null;
					return (
						<div key={i} style={{ backgroundColor: i === tabCompletePtr ? "#6200ee" : "" }}>
							{badgeURL ? (
								<img className="autocomplete-preview-img" alt="" src={badgeURL} />
							) : (
								""
							)}
							{x.value}
						</div>
					);

				default:
					return null;
			}
		})
	);

class Footer extends Component {
	state = {
		inputText: "",
		chatInput: "",
		wantedUsername: "",
		inputHistory: [],
		inputHistoryPtr: -1,

		tabCompleteActive: false,
		tabCompleteSubjects: [],
		tabCompletePtr: 0,
		tabCompleteWordStart: 0,
		tabCompleteWordEnd: 0
	};

	componentDidMount() {
		if (this.props.authenticated) {
			this.focusChatInput();
		}
	}

	focusChatInput() {
		this.chatInput.focus();
	}

	componentDidUpdate() {
		if (!this.props.emoteMenuVisible && this.props.user.state === "completed") {
			this.focusChatInput();
		} else if (this.props.user.state === "nodoc") {
			this.usernameInput.focus();
		}

		const { tabCompleteActive, tabCompleteWordEnd, tabCompleteSelectionUpdate } = this.state;
		if (tabCompleteActive && tabCompleteSelectionUpdate) {
			this.chatInput.setSelectionRange(tabCompleteWordEnd, tabCompleteWordEnd);
			this.setState({ tabCompleteSelectionUpdate: false });
		}
	}

	handleUsernameInput = event => {
		if (event.target.value.length < 17) {
			this.setState({ wantedUsername: event.target.value });
		}
	};

	handleChatInput = event => {
		if (event.target.value.length < 200) {
			this.setState({ chatInput: event.target.value, tabCompleteActive: false });
		}
	};

	handleSelect = () => {
		if (!this.chatInput);
		const { tabCompleteActive, tabCompleteWordStart, tabCompleteWordEnd } = this.state;

		if (
			tabCompleteActive &&
			(this.chatInput.selectionStart < tabCompleteWordStart ||
				this.chatInput.selectionEnd > tabCompleteWordEnd)
		) {
			this.setState({ tabCompleteActive: false });
		}
	};

	handleTab(next = true) {
		const chatInput = this.chatInput;
		if (!chatInput) return;

		let {
			tabCompleteActive,
			tabCompleteSubjects,
			tabCompletePtr,
			tabCompleteWordStart,
			tabCompleteWordEnd
		} = this.state;

		const chatValue = this.chatInput.value;
		const cursorPosition = chatInput.selectionStart;

		if (!tabCompleteActive) {
			tabCompleteActive = true;

			// First order of business - find the point where our word starts
			const beforeCursor = chatValue.substr(0, cursorPosition);
			const wordStartIndex = beforeCursor.lastIndexOf(" ") + 1;

			// If the word start index is the cursorPosition, then we do not have a word before the cursor.
			if (cursorPosition === wordStartIndex) return;

			// Find where our word ends, then grab the word
			const afterWord = chatValue.substr(wordStartIndex, chatValue.length - wordStartIndex);
			let wordEndIndex = afterWord.indexOf(" ");
			wordEndIndex = wordEndIndex === -1 ? afterWord.length : wordEndIndex;
			const word = afterWord.substring(0, wordEndIndex);

			tabCompleteSubjects = this.props.autoCompleteService.tabComplete(word);

			tabCompleteWordStart = wordStartIndex;
			tabCompleteWordEnd = wordStartIndex + wordEndIndex;
			tabCompletePtr = -1;
		}

		let newText;
		if (tabCompleteSubjects.length !== 0) {
			if (next) {
				tabCompletePtr =
					tabCompletePtr === tabCompleteSubjects.length - 1 ? 0 : tabCompletePtr + 1;
			} else {
				tabCompletePtr =
					tabCompletePtr === 0 ? tabCompleteSubjects.length - 1 : tabCompletePtr - 1;
			}

			const beforeText = chatValue.substring(0, tabCompleteWordStart);
			const afterText = chatValue.substr(tabCompleteWordEnd, chatValue.length);
			const insertedText = tabCompleteSubjects[tabCompletePtr].value;
			newText = beforeText + insertedText + " " + afterText;
			tabCompleteWordEnd = tabCompleteWordStart + insertedText.length + 1;
		}

		this.setState({
			tabCompleteActive,
			tabCompleteSubjects,
			tabCompletePtr,
			tabCompleteWordStart,
			tabCompleteWordEnd,
			...(newText ? { chatInput: newText } : {}),
			tabCompleteSelectionUpdate: true
		});
	}

	handleKeyDown = event => {
		let preventDefault = true;

		const { tabCompleteActive } = this.state;

		switch (event.key) {
			case "Enter":
				if (tabCompleteActive) {
					this.setState({ tabCompleteActive: false });
					break;
				}

				this.props._submitChatMessage(this.state.chatInput);

				this.setState({
					chatInput: "",
					inputHistoryPtr: -1,
					inputHistory: [this.state.chatInput, ...this.state.inputHistory].slice(0, 100),
					tabCompleteActive: false
				});
				break;

			case "ArrowUp":
			case "ArrowDown":
				const { inputHistoryPtr, inputHistory } = this.state;
				const isUp = event.key === "ArrowUp";

				if (tabCompleteActive) {
					this.handleTab(!isUp);
					break;
				}

				if (inputHistory.length === 0) return;

				const newPtr = Math.min(
					Math.max(inputHistoryPtr + (isUp ? 1 : -1), -1),
					inputHistory.length - 1
				);
				this.setState({
					inputHistoryPtr: newPtr,
					chatInput: newPtr === -1 ? "" : inputHistory[newPtr]
				});
				break;

			case "Tab":
				this.handleTab();
				break;

			default:
				preventDefault = false;
		}

		if (preventDefault) event.preventDefault();

		// some browsers are Pepega
		return false;
	};

	insertText = text => {
		if (this.state.chatInput.length + text.length < 200) {
			this.setState({ chatInput: `${this.state.chatInput}${text}`, tabCompleteActive: false });
		}
	};

	renderPunishment() {
		const punishment = this.props.user.punishments[0];

		return (
			<div className="timedOutBar">
				{punishment.punishData === "timeout" ? (
					<span>
						Timed out: <Countdown date={punishment.end * 1000} />
					</span>
				) : (
					"Permbanned"
				)}
			</div>
		);
	}

	renderSettingsIcons = user => {
		if (!user.badges) return null;
		const isAdmin = user.badges.includes("admin");
		const isGlobalMod = isAdmin || user.badges.includes("globalmod");
		return (
			<Fragment>
				{isGlobalMod && (
					<img
						onClick={() => this.props.toggleModal("moderatorSettings")}
						className="optionButton"
						alt="Moderation Settings"
						src={modIcon}
					/>
				)}
				{isAdmin && (
					<img
						onClick={() => this.props.toggleModal("adminSettings")}
						className="optionButton"
						alt="Admin Settings"
						src={adminIcon}
					/>
				)}
			</Fragment>
		);
	};

	render() {
		return (
			<Fragment>
				<div
					className="footer"
					style={{ height: this.props.user.state === "nodoc" ? 200 : 120 }}>
					{this.props.isBanned &&
					this.props.user.punishments &&
					this.props.user.punishments.length ? (
						this.renderPunishment()
					) : this.props.user.state === "complete" ? (
						this.props.emotes.features.sponsorMode &&
						!this.props.user.badges.incluydes("sponsor") &&
						!this.props.user.badges.includes("admin") &&
						!this.props.user.badges.includes("globalmod") &&
						!this.props.user.badges.includes("cxstreamer") ? (
							<div
								style={{
									alignItems: "center",
									justifyContent: "center",
									diaplay: "flex",
									textAlign: "center"
								}}>
								<p style={{ fontWeight: 600, color: "rgb(0, 229, 174)", marginBottom: -12 }}>
									Sponsor-only mode is enabled
								</p>
								<p style={{ color: "#FFF", fontSize: 12 }}>
									If you're already a sponsor, link it by typing{" "}
									<font face="Courier">!link [new chat username]</font> in Ice's YouTube chat
								</p>
							</div>
						) : (
							<div className="chatBar">
								{this.state.tabCompleteActive ? (
									<div className="autocomplete">
										<AutoCompleteItems
											badges={this.props.emotes.badges}
											tabCompleteActive={this.state.tabCompleteActive}
											tabCompleteSubjects={this.state.tabCompleteSubjects}
											tabCompletePtr={this.state.tabCompletePtr}
											tabCompleteWordStart={this.state.tabCompleteWordStart}
											tabCompleteWordEnd={this.state.tabCompleteWordEnd}
										/>
									</div>
								) : null}

								<input
									className="chatBarInput"
									ref={el => (this.chatInput = el)}
									value={this.state.chatInput}
									onKeyDown={this.handleKeyDown}
									onChange={this.handleChatInput}
									onSelect={this.handleSelect}
									placeholder="Send a message..."
								/>
								<button
									className="iconButton emoteButton"
									onClick={this.props.onEmoteMenuToggle}>
									<EmoteIcon color={this.props.emoteMenuVisible ? "#FFFFFF" : "#707070"} />
								</button>
							</div>
						)
					) : (
						<div>
							{this.props.user.state === "none" ? (
								<Button onClick={this.props._attemptLogin}>Sign in to chat</Button>
							) : (
								<div>
									{this.props.user.state === "nodoc" ? (
										<div
											style={{
												display: "flex",
												flexDirection: "column",
												justifyContent: "center",
												alignItems: "center"
											}}>
											<p
												style={{
													color: "#FFF",
													fontSize: 18,
													fontFamily: "Open Sans",
													fontWeight: 600
												}}>
												Choose a username
											</p>
											<div style={{ display: "flex", flexDirection: "row" }}>
												<input
													ref={el => (this.usernameInput = el)}
													value={this.state.wantedUsername}
													onChange={this.handleUsernameInput}
													className="usernameInput"
													placeholder="Username"
													disabled={this.props.isBanned}
												/>
												<Button
													onClick={() =>
														this.props._requestUsername(this.state.wantedUsername)
													}>
													Go
												</Button>
											</div>
											{this.props.errors.username && (
												<p style={{ fontFamily: "Courier", color: "#e53635" }}>
													{this.props.errors.username}
												</p>
											)}
										</div>
									) : (
										<p style={{ color: "#FFF" }}>unknown error (state_unknown), refresh?</p>
									)}
								</div>
							)}
						</div>
					)}

					<div className="chatExperience">
						<div className="optionButtons">
							<img
								onClick={() => this.props.toggleModal("generalSettings")}
								className="optionButton"
								alt="General Settings"
								src={settingsIcon}
							/>
							{this.renderSettingsIcons(this.props.user)}
							{/*<img className="optionButton" alt="Viewer List" src={peopleIcon} />*/}
						</div>
						{this.props.user.state === "complete" && (
							<div className="chatUserDisplay">
								{this.props.user.badges.map((b, i) => {
									return (
										<img
											key={i}
											style={{ width: 18, height: 18, marginRight: 5 }}
											src={this.props.emotes.badges[b].image}
											alt={b.fullName}
										/>
									);
								})}
								<p
									style={{
										color:
											this.props.user.badges.length > 0
												? this.props.emotes.badges[this.props.user.badges[0]].nameColor
												: this.props.generateColorFromString(this.props.user.username),
										fontFamily: "Open Sans",
										margin: 0,
										fontWeight: 600
									}}>
									{this.props.user.username}
								</p>
							</div>
						)}
					</div>
				</div>
			</Fragment>
		);
	}
}

export default Footer;
