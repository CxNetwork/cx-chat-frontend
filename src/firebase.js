import firebase from "@firebase/app";
import "@firebase/auth";

let config = {
  apiKey: "AIzaSyAIxF2RdkNkDZ-WOVydh3igROrsR0kVPA4",
  authDomain: "chat.iceposeidon.com",
  databaseURL: "https://cx-chat-204113.firebaseio.com",
  projectId: "cx-chat-204113",
  storageBucket: "cx-chat-204113.appspot.com",
  messagingSenderId: "762730644662"
};

firebase.initializeApp(config);

export default firebase;

export const auth = firebase.auth();
