import React, { Component } from "react";
import ReactModal from "react-modal";
import Button from "@material/react-button";

import { saveState } from "../util";
import "../modal.css";

class Modal extends Component {
	state = {
		unbanUser: "",
		unbanUserStatus: ""
	};

	componentDidMount() {
		ReactModal.setAppElement("#root");
	}

	openModal = () => {
		this.setState({ modalIsOpen: true });
	};

	closeModal = () => {
		this.setState({ modalIsOpen: false });
	};

	setFontSize = ({ target: { value } }) => {
		saveState("chatFontSize", value);
		this.props.setChatFontSize(value);
	};

	doUnban = (e) => {
		e.preventDefault();
		
		const setStatus = (msg) => {
			this.setState({ unbanUserStatus: msg });
		}

		const { unbanUser } = this.state;
		if (unbanUser.trim() === '') return setStatus("Cannot unban empty name!");

		setStatus("Attempting to unban");

		
		fetch("https://api-production.iceposeidon.com/chat/moderate", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				authorization: this.props.token
			},
			body: JSON.stringify({
				action: "unban",
				username: unbanUser
			})
		})
			.then((data) => {
				if (!this) return;
				
				if (data.status === 404)
					return setStatus("User not found!");

				setStatus("Unbanned!");
			})
			.catch(ex => {
				if (!this) return;
				setStatus("Failed to unban. Check console");
				console.log(`failed to execute mod action: ${ex}`);
			});
	};

	render() {
		return (
			<ReactModal
				isOpen={this.props.isOpen}
				shouldCloseOnEsc={true}
				shouldFocusAfterRender={true}
				shouldCloseOnOverlayClick={true}
				onRequestClose={() => this.props.toggleModal(null)}
				className="generic-modal"
				overlayClassName="modal-overlay"
				contentLabel="Example Modal">
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						justifyContent: "space-between",
						height: "100%"
					}}>
					<h2 style={{ textAlign: "center", fontFamily: "Open Sans" }}>Moderator Settings</h2>
					<div>
						<div style={{ padding: 5 }}>
							<form>
								Person to unban / unpunish:{" "}
								<input
									value={this.state.unbanUser}
									onInput={({ target: { value } }) => this.setState({ unbanUser: value })}
									type="text"
									placeholder="Username"
								/>
								{" "}
								<Button raised onClick={this.doUnban}>
									Unban
								</Button>
								{" "}
								<span>{this.state.unbanUserStatus}</span>
							</form>
						</div>
					</div>
					<Button raised onClick={() => this.props.toggleModal(null)}>
						close
					</Button>
				</div>
			</ReactModal>
		);
	}
}

export default Modal;
