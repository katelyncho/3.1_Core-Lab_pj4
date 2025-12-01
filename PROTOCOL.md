# Protocol

All messages are sent as JSON strings.

## Client

### 1. setUser

Sent once when a user picks a hex color and clicks “set”

```json
{
  "type": "setUser",
  "userId": "<hex-color-string>",
  "score": 0
}
```

- Client sets hex color

Server sends a message if the color is already in use on the leaderboard

- If this userId is new, the server creates a new entry:

```json
{
  userId: <string>,
  score: 0,
  top: <random 5–95>,
  left: <random 5–95>
}

```

#### 2. updateScore

Sent every time the user clicks the page after setting a userId

```json
{
  "type": "updateScore",
  "score": <number>
}
```

## Server

### leaderboard

- When a client connects
- After every setUser
- After every updateScore
- When a client disconnects

```json
{
  "type": "leaderboard",
  "players": [
    {
      "userId": "<string>",
      "score": <number>,
      "top": <number>,
      "left": <number>
    }
  ]
}
```

### Disconnect

When a client disconnects, the server sends all clients:

```json
{
  "type": "disconnected",
  "userId": <string>
}
```
