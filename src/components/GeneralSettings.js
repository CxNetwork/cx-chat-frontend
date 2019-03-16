import React, { Component } from "react";
import ReactModal from "react-modal";
import Button from "@material/react-button";
import Switch from "@material/react-switch";
import Slider from "rc-slider/lib/Slider";

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

	setFontSize = value => {
		saveState("chatFontSize", value);
		this.props.setChatFontSize(value);
	};

	setMessageBuffer = value => {
		saveState("messageBufferSize", value);
		this.props.setMessageBuffer(value);
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
						height: "100%",
						padding: 15,
						display: "flex",
						flexDirection: "column",
						justifyContent: "space-around"
					}}>
					<h2 style={{ textAlign: "center", fontFamily: "Open Sans" }}>General Settings</h2>
					<div>
						<div style={{ padding: 5 }}>
							<p style={{ fontFamily: "Open Sans", fontWeight: 600 }}>
								Font Size ({this.props.chatFontSize})
							</p>
							<Slider
								min={5}
								max={25}
								onChange={this.setFontSize}
								value={parseInt(this.props.chatFontSize)}
							/>
						</div>
						<div style={{ padding: 5 }}>
							<p style={{ fontFamily: "Open Sans", fontWeight: 600 }}>Show YouTube Messages</p>
							<Switch
								nativeControlId="hideYoutubeMessages"
								style={{ color: "#000" }}
								checked={!this.props.youtubeHidden}
								onChange={this.props.toggleYoutubeHidden}
							/>
						</div>
						<div style={{ padding: 5 }}>
							<p style={{ fontFamily: "Open Sans", fontWeight: 600 }}>
								@mention Sound Effects
							</p>
							<Switch
								nativeControlId="toggleMentionSound"
								checked={!this.props.mentionSoundsDisabled}
								onChange={this.props.toggleMentionSounds}
							/>
						</div>
						<div style={{ padding: 5 }}>
							<p style={{ fontFamily: "Open Sans", fontWeight: 600 }}>
								Message Buffer Size (set lower if you're lagging) ({this.props.messageBuffer})
							</p>
							<Slider
								min={5}
								max={200}
								onChange={this.setMessageBuffer}
								value={parseInt(this.props.messageBuffer)}
							/>
						</div>
					</div>
					<Button raised onClick={this.props._logout}>
						log out
					</Button>
					<Button raised onClick={() => this.props.toggleModal(null)}>
						close
					</Button>
				</div>
			</ReactModal>
		);
	}
}

export default Modal;
