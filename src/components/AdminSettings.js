import React, { Component } from "react";
import ReactModal from "react-modal";
import Button from "@material/react-button";
import Switch from "@material/react-switch";

import { saveState } from "../util";
import "../modal.css";

class Modal extends Component {
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

	toggleSponsorMode = () => {
		fetch("https://api-production.iceposeidon.com/chat/toggleSponsorMode", {
			method: "POST",
			headers: {
				authorization: this.props.token
			}
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
					<h2 style={{ textAlign: "center" }}>Admin Settings</h2>
					<div style={{ padding: 5 }}>
						<p style={{ fontFamily: "Open Sans", fontWeight: 600 }}>Sponsor-only mode</p>
						<Switch
							nativeControlId="toggleMentionSound"
							checked={this.props.features.sponsorMode}
							onChange={this.toggleSponsorMode}
						/>
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
