import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import "@material/react-switch/dist/switch.css";
import "rc-slider/assets/index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

ReactDOM.render(<App />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();

// Disable logging in production.
function noop() {}

if (process.env.NODE_ENV !== "development") {
	console.log = noop;
	console.warn = noop;
	console.error = noop;
}
