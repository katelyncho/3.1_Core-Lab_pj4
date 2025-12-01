import express from "express";
import expressWs from "express-ws";

const server = express();
expressWs(server);

server.use(express.static("."));

const port = 3000;

let clients = {};
let nextId = 1;

server.ws("/ws", (ws, req) => {
  const id = nextId++;
  clients[id] = { ws: ws, userId: null, score: 0 };

  ws.on("message", (data) => {
    let msg;
    try {
      msg = JSON.parse(data);
    } catch (e) {
      return;
    }

    if (msg.type === "setUser") {
      const userId = String(msg.userId || "").trim();
      if (!userId) return;
      clients[id].userId = userId;
      if (typeof msg.score === "number") {
        clients[id].score = msg.score;
      } else {
        clients[id].score = 0;
      }
      sendLeaderboard();
    }

    if (msg.type === "updateScore") {
      if (typeof msg.score === "number") {
        clients[id].score = msg.score;
        sendLeaderboard();
      }
    }
  });

  ws.on("close", () => {
    delete clients[id];
    sendLeaderboard();
  });

  // send current leaderboard to this new client
  sendLeaderboard();
});

function getLeaderboard() {
  let players = [];
  for (let key in clients) {
    const c = clients[key];
    if (c.userId) {
      players.push({ userId: c.userId, score: c.score || 0 });
    }
  }
  return players;
}

function sendLeaderboard() {
  const message = JSON.stringify({
    type: "leaderboard",
    players: getLeaderboard(),
  });

  for (let key in clients) {
    const c = clients[key];
    try {
      c.ws.send(message);
    } catch (e) {}
  }
}

server.listen(port, () => {
  console.log("websocket server on port", port);
});
