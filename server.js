import express from "express";
import expressWs from "express-ws";

const server = express();
expressWs(server);

const port = 3000;

let clients = {};
let global_id = 0;

let players = {};

server.ws("/ws", (client, req) => {
  const id = global_id++;
  clients[id] = { client: client, userId: null };

  client.on("message", (data) => {
    let msg;
    try {
      msg = JSON.parse(data);
    } catch (e) {
      return;
    }

    if (msg.type === "setUser") {
      let userId = String(msg.userId || "").trim();
      if (!userId) return;

      clients[id].userId = userId;

      if (!players[userId]) {
        const top = 5 + Math.random() * 90;
        const left = 5 + Math.random() * 90;
        players[userId] = {
          userId: userId,
          score: 0,
          top: top,
          left: left,
        };
      }

      if (typeof msg.score === "number") {
        players[userId].score = msg.score;
      }

      sendLeaderboard();
    }

    if (msg.type === "updateScore") {
      const userId = clients[id].userId;
      if (!userId) return;

      if (!players[userId]) {
        const top = 5 + Math.random() * 90;
        const left = 5 + Math.random() * 90;
        players[userId] = {
          userId: userId,
          score: 0,
          top: top,
          left: left,
        };
      }

      if (typeof msg.score === "number") {
        players[userId].score = msg.score;
        sendLeaderboard();
      }
    }
  });

  client.on("close", () => {
    delete clients[id];
    sendLeaderboard();
  });

  sendLeaderboard();
});

function send(client, message) {
  try {
    client.send(JSON.stringify(message));
  } catch (e) {}
}

function broadcast(message) {
  for (let key in clients) {
    send(clients[key].client, message);
  }
}

function sendLeaderboard() {
  const list = Object.values(players);
  broadcast({ type: "leaderboard", players: list });
}

server.listen(port, "0.0.0.0", () => {});
