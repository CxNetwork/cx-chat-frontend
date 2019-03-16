import React, { Component } from "react";
import closeIcon from "../assets/close.svg";

export default class ModerationTools extends Component {
	state = {
		timeoutTime: 600 // seconds
	};

	performAction = (action, args) => {
		fetch("https://api-production.iceposeidon.com/chat/moderate", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				authorization: this.props.token
			},
			body: JSON.stringify({
				action,
				...args,
				username: this.props.user.username
			})
		})
			.then(() => {
				if (!this) return;
				this.setState({ message: `${action} executed :SMILE:!` });
			})
			.catch(ex => {
				if (!this) return;
				this.setState({ message: `${action} failed to execute!` });
				console.log(`failed to execute mod action: ${ex}`);
			});
	};

	render() {
		return (
			<div className="moderation-tools">
				<div className="moderation-header">
					<button className="button-unstyled">
						<img
							className="moderation-exit"
							alt="Close"
							onClick={() => this.props.onClose()}
							src={closeIcon}
						/>
					</button>
					<span className="moderation-username">{this.props.user.username}</span>
				</div>

				{this.state.message ? this.state.message : ""}

				<div className="moderation-actions">
					<button className="moderation-action" onClick={() => this.performAction("ban")}>
						Ban
					</button>
					<button className="moderation-action" onClick={() => this.performAction("timeout")}>
						Timeout {this.state.timeoutTime}s
					</button>
				</div>
			</div>
		);
	}
}
