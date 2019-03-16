const racismRegex = /(?:n|𝗇|𝐍|η|Ν|𝐧|n|𝓷­|𝖭|n͏|n|ꓠ|𝚗|🆖|🇳)(?:i|i­­|­i­|i­­|ι|i|i|I­|_|y|🇮|𝓲||𝐢𝗂|і|j|ï|1|ı|🆖|l|\||\u005c|\u002f|\u007c|!|¡){1,50}(?:g|🇬|ɡ|𝐠|g͏|ɢ|ġ|𝓰|ģ|­g|­­g|ǧ|ǵ){2,}(?:3|🇪|€|ε|ε|𝒆|e|é|ě|𝐞|ȩ|­­E|ė|е){1,50}(?:r|ŕ|𝐫|ř|ŗ|ṙ|𝓻|🇷)/gim;

export function randStr(len) {
	let s = "";
	while (s.length < len)
		s += Math.random()
			.toString(36)
			.substr(2, len - s.length);
	return s;
}

export function isRacist(str) {
	str = str.toLowerCase().replace(/[\u200B-\u200D\uFEFF]/g, "");
	if (str.includes("nigger")) return true;
	return racismRegex.test(str.replace(/\s/g, "").replace(/[^A-Za-z]/g, ""));
}

// Returns *true* if it shouldn't be sent.
export function validateMessage(msg) {
	if (msg.length < 1 || msg.length > 200) return true;
	if (isRacist(msg)) return true;
	if (["r/ipcj", " ipcj", "swat", "dox", "้", "็"].some(w => msg.toLowerCase().includes(w))) {
		return true;
	}
	return false;
}

export const loadState = key => {
	try {
		const serializedState = localStorage.getItem(key);
		if (serializedState === null) {
			return undefined;
		}
		return JSON.parse(serializedState);
	} catch (err) {
		return undefined;
	}
};

export const saveState = (key, state) => {
	try {
		const serializedState = JSON.stringify(state);
		localStorage.setItem(key, serializedState);
	} catch (err) {
		return undefined;
	}
};

export const isModerator = ({ badges, state, username }) => {
	if (state !== "complete") return false;
	if (username === "Ice_Poseidon") return false;

	return badges.includes("globalmod") || badges.includes("admin");
};
