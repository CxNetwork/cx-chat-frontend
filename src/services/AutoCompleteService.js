const CLEANUP_RATE = 15 * 60 * 1000;
const USER_PURGE_TIME = 10 * 60 * 1000;

export default class AutoCompleteService {
	usersSortStale = true;
	usersSorted = [];
	users = new Map();
	emptyMentionUsers = [];
	emotes = new Map();

	init() {
		window.test = this;
		setInterval(this.cleanup, CLEANUP_RATE);
	}

	setEmotes(emotes) {
		this.emotes.clear();

		// Map preserves insertion order - so we can do our sort now for better perf
		const sortedNames = Object.keys(emotes)
			.map(x => [x.toLowerCase(), x])
			.sort(([a], [b]) => this.sort(a, b));

		for (const name of sortedNames) {
			const [lowerCaseName, captializedName] = name;
			const url = emotes[captializedName];

			this.emotes.set(lowerCaseName, { type: "emote", value: captializedName, url });
		}
	}

	sort = (a, b) => {
		// First order - length
		if (a.length > b.length) return 1;
		if (a.length < b.length) return -1;

		// Second order - Alphabetical
		if (a === b) return 0;
		return a > b ? 1 : -1;
	};

	// This function will only be called when we actually begin a
	// tab search, and will then only be called afterwards if a tab
	// search is called with an expired cached last version.
	generateUsersIndex() {
		// Not stale, no need to do anything.
		if (!this.usersSortStale) return;
		
		this.usersSorted = Array.from(this.users.keys()).sort(this.sort);
		this.usersSortStale = false;
	}

	addUser(username, data) {
		const usernameLowerCase = username.toLowerCase();
		
		// New user, need to flag the index as invalid.
		if (!this.users.has(usernameLowerCase)) {
			this.usersSortStale = true;
		}
		
		// Add to users object
		this.users.set(usernameLowerCase, {
			type: "user",
			value: `@${username}`,
			lastSpokeAt: Date.now(),
			data
		});

		// Add to the list of users to show when initially just @'ing
		this.emptyMentionUsers = [
			...this.emptyMentionUsers.filter(x => x !== username),
			username
		].slice(-10);
	}

	tabComplete(initial) {
		initial = initial.trim().toLowerCase();
		if (initial.length === 0) return [];

		const isTagMention = initial[0] === "@";
		if (isTagMention) initial = initial.substr(1); // remove @
		const response = [];

		// Handle emote names
		if (!isTagMention) {
			let maxEmotes = 10;
			for (const key of this.emotes.keys()) {
				if (key.startsWith(initial)) {
					response.push(this.emotes.get(key));

					if (--maxEmotes === 0) break;
				}
			}
		}

		// Generate the user index if required.
		this.generateUsersIndex();
		
		// Handle user names
		let maxUsers = 7;
		
		for (const key of this.usersSorted) {
			if (key.startsWith(initial)) {
				response.push(this.users.get(key));

				if (--maxUsers === 0) break;
			}
		}

		return response;
	}

	// Clean the users list in order to prevent OOM
	cleanup = () => {
		for (const [username, data] of this.users.entries()) {
			const { lastSpokeAt } = data;

			// If still in date, keep
			if (Date.now() - lastSpokeAt < USER_PURGE_TIME) continue;

			// Out of date - delete
			if (this.emptyMentionUsers.includes(username)) {
				this.emptyMentionUsers = this.emptyMentionUsers.filter(x => x !== username);
			}

			if (this.usersSorted.includes(username)) {
				this.usersSorted = this.usersSorted.filter(x => x !== username);
			}

			this.users.delete(username);
		}
	};
}
