import React, { Component } from "react";

import { randStr } from "../util";

class Debug extends Component {
	state = {
		dummyMessages: false
	};

	componentDidMount() {
		this.isDev = process.env.NODE_ENV === "development";
	}

	randomMessage() {
		return {
			b: [],
			c: randStr(Math.floor(Math.random() * 150)),
			t: "ccm",
			u: "Testing User"
		};
	}

	toggleDummy = () => {
		this.setState({ dummyMessages: !this.state.dummyMessages });
		if (this.dummyInterval) {
			clearInterval(this.dummyInterval);
			this.dummyInterval = null;
			console.log("Dummy messages off.");
		} else {
			console.log("Dummy messages toggled on.");
			this.dummyInterval = setInterval(() => this.props.addMsg(this.randomMessage()), 100);
		}
	};

	setFontSize = ({ target: { value } }) => {
		this.props.setChatFontSize(value);
	};

	render() {
		if (!this.isDev) return null;
		const { dummyMessages } = this.state;
		return (
			<div
				style={{
					fontSize: 12,
					zIndex: 99,
					padding: 10,
					width: 180,
					height: 100,
					backgroundColor: "rgba(255,255,255,0.1)",
					position: "absolute",
					right: 0,
					bottom: "128px"
				}}>
				<h3 style={{ padding: 0, margin: 0, textAlign: "center" }}>Debug</h3>
				<p
					style={{
						cursor: "pointer",
						textDecoration: dummyMessages ? "underline" : ""
					}}
					onClick={this.toggleDummy}>
					Toggle Dummy Messages
				</p>

				<div style={{ display: "flex" }}>
					Font Size:
					<input
						style={{ width: 30, marginLeft: 10 }}
						onChange={this.setFontSize}
						value={this.props.chatFontSize}
						type="number"
						min="1"
						max="150"
					/>
				</div>
			</div>
		);
	}
}

export default Debug;
