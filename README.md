# cx-chat-frontend
This was our frontend react app for the Cx chat on chat.iceposeidon.com - we're deprecating this chat on the website so we're making the frontend open source. The server-side socket and API is remaining private, but see the backend section below on how to design and orchestrate the server-side.

## Built by...
Ciaran (chat rendering, tokenization, autocomplete, emote menu)  
Phineas (backend, chat socket, api, authentication, ui design)  
segfault (user settings panel, mod/admin panel, help with chat rendering and name colors)  

## Features
- Dynamic emotes, loaded in from our API
- Emote autocompletion on tab
- User mentioning with autocomplete
- In-chat badges and name colors that link to those badges
- Full fledged user system
- Unique username section
- JWT socket + API route authentication
- SocketCluster client capabilities
- Full-fledged moderation system
- Moderation, admin panels
- Subscriber/Sponsor-only mode
- Dynamic user badges
- Name colors based on username hash
- Time-outs/permban system
- Chat message buffers
- High performance chat message rendering
- Client-side filter
- Emote selection menu (using EmojiMart)
- Firebase authentication

## Backend
The chat is websocket-based using [SocketCluster](https://github.com/SocketCluster/socketcluster) and UWS. There is also an API component used to get initial data and certain methods, like the moderation system and username selection. An example init api request goes like this:

- User requests /chat/init endpoint with Firebase authentication token
- Server checks email extracted Firebase token, responds with correct state
- State could be that the user account exists, returning the details, or it could be that they're not signed up
- If not signed up yet, the client will prompt the user to choose a username then send it to an API route
- If everything's good to go, the API will respond with the user's information (username, punishment info, emotes, badges, etc)
- It also responds with an authToken, which is a JWT token signed by the server which resolves to the user's username and badges, which we use on the SocketCluster side to ingest and publish chat messages
- We also use the authToken for every API request
