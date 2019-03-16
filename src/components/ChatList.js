import React, { Component, Fragment } from "react";
import { Twemoji } from "react-emoji-render";
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";

import "../chat.css";
import banhammerIcon from "../assets/banhammer.svg";
import ModerationTools from "./ModerationTools";
import { isModerator } from "../util";

// TODO: Had to switch PureComponent to Component to work.
// Switch back? would a memoized functional component be better?
export class ChatList extends Component {
	scrollDiv = React.createRef();
	state = {
		scrolledManually: false
	};

	renderTokens(tokens, badges) {
		return tokens.map((token, key) => {
			switch (token.type) {
				case "LINK":
					return (
						<a key={key} href={token.url.href} target={"_blank"}>
							{token.url.toString()}
						</a>
					);

				case "EMOTE":
					const base = (
						<img
							key={key}
							className="emote"
							src={this.props.emotes.emojiMappings[token.name]}
							alt={token.textRepresentation}
							title={token.textRepresentation}
						/>
					);

					// Return base if no modifiers
					if (token.modifiers.length < 1) return base;

					// Stack modifiers on top
					return (
						<span key={key} className="emote-stacked-container">
							{base}
							{token.modifiers.map((x, i) => (
								<img
									key={i}
									className="emote emote-modifier"
									src={this.props.emotes.modifiers[x]}
									alt={x}
								/>
							))}
						</span>
					);

				case "HIGHLIGHT":
					return (
						<span key={key} className="highlight">
							{token.value}
						</span>
					);

				case "TEXT":
					return <span key={key}>{token.value}</span>;

				case "YOUTUBE_MESSAGE":
					return (
						<span key={key} style={{ fontStyle: "italic", color: "#797979" }}>
							{token.content}
						</span>
					);

				default:
					return null;
			}
		});
	}

	componentDidUpdate() {
		if (this.state.scrolledManually) return;
		if (this.state.moderationTarget) return;
		this.scrollToBottom();
	}

	onScroll = () => {
		if (this.didJustScroll) {
			this.didJustScroll = false;

			if (this.state.scrolledManually) {
				this.setState({ scrolledManually: false });
			}

			return;
		}

		const atBottom =
			this.scrollDiv.current.scrollTop >=
			this.scrollDiv.current.scrollHeight - this.scrollDiv.current.offsetHeight;
		this.setState({ scrolledManually: !atBottom });
	};

	openModMenu = user => {
		this.setState({
			moderationTarget: user
		});
	};

	closeModMenu = () => {
		this.setState({
			moderationTarget: null
		});

		this.scrollToBottom();
	};

	scrollToBottom = force => {
		if (this.state.moderationTarget && !force) return;

		if (force && this.state.moderationTarget) {
			this.setState({ moderationTarget: null });
		}

		this.didJustScroll = true;
		this.scrollDiv.current.scrollTop = this.scrollDiv.current.scrollHeight;
	};

	render() {
		return (
			<div className="chat-flex-container" style={{ color: "white" }}>
				<div
					className="chat-items"
					style={{ fontSize: `${this.props.chatFontSize}px` }}
					ref={this.scrollDiv}
					onScroll={this.onScroll}>
					<div className="chat-restrict">
						{this.props.messages.map(m => {
							return (
								<div key={m.key} className="chat-list-item">
									{isModerator(this.props.user) ? <Fragment>
										<ContextMenuTrigger id={m.username}>
		    							<button
												className="button-unstyled"
												onClick={() => this.props.onMention(m.username)}>
												{m.badges.length > 0 &&
													m.badges.map((b, i) => (
														<img
															key={i}
															className="badge"
															src={this.props.emotes.badges[b].image}
															alt={b.fullName}
														/>
													))}
												<Twemoji style={{ color: m.color, fontWeight: 600 }} text={m.username} />
											</button>
											<button className="button-unstyled" onClick={() => this.openModMenu(m)}>
												<img className="mod-tools-toggle" src={banhammerIcon} alt="Ban" />
											</button>
											: {this.renderTokens(m.content, m.badges)}
										</ContextMenuTrigger>
										<ContextMenu id={m.username} onHide={this.props.handleModContextMenuClose} onShow={this.props.handleModContextMenuOpen}>
						          <MenuItem data={{username: m.username, time: 5}} onClick={this.props.handleModContextMenuClick}>
						          	TimeOut <span style={{fontWeight: 600, color: m.color}}>{m.username}</span> for 5min
						        	</MenuItem>
							        <MenuItem divider />
							        <MenuItem data={{username: m.username, time: 10}} onClick={this.props.handleModContextMenuClick}>
						          	TimeOut <span style={{fontWeight: 600, color: m.color}}>{m.username}</span> for 10min
							        </MenuItem>
							        <MenuItem divider />
							        <MenuItem data={{username: m.username, time: 30}} onClick={this.props.handleModContextMenuClick}>
						          	TimeOut <span style={{fontWeight: 600, color: m.color}}>{m.username}</span> for 30min
							        </MenuItem>
							        <MenuItem divider />
							        <MenuItem data={{username: m.username, time: 60}} onClick={this.props.handleModContextMenuClick}>
						          	TimeOut <span style={{fontWeight: 600, color: m.color}}>{m.username}</span> for 1h
							        </MenuItem>
							      </ContextMenu>
						      </Fragment> :
									<Fragment>
										<button
											className="button-unstyled"
											onClick={() => this.props.onMention(m.username)}>
											{m.badges.length > 0 &&
												m.badges.map((b, i) => (
													<img
														key={i}
														className="badge"
														src={this.props.emotes.badges[b].image}
														alt={b.fullName}
													/>
												))}
											<Twemoji style={{ color: m.color, fontWeight: 600 }} text={m.username} />
										</button>
										: {this.renderTokens(m.content, m.badges)}
									</Fragment>}
								</div>
							);
						})}
					</div>
				</div>

				{this.state.scrolledManually || this.state.moderationTarget ? (
					<button
						className="button-unstyled scrollDownContainer"
						onClick={() => this.scrollToBottom(true)}>
						<p>
							{this.state.moderationTarget
								? "Modtools activated - close modtools to scroll"
								: "Click / scroll to bottom to resume autoscrolling"}
						</p>
					</button>
				) : null}

				{this.state.moderationTarget ? (
					<ModerationTools
						user={this.state.moderationTarget}
						token={this.props.token}
						onClose={() => this.closeModMenu()}
					/>
				) : null}
			</div>
		);
	}
}

export default ChatList;
