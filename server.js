import express from "express";
import expressWs from "express-ws";

const server = express();
expressWs(server);

server.use(express.static("."));

const port = 3000;

let clients = {};
let global_id = 0;

server.ws("/ws", (client, req) => {
  const id = global_id++;
  clients[id] = { client: client, userId: null, score: 0 };

  client.on("message", (data) => {
    let msg;
    try {
      msg = JSON.parse(data);
    } catch (e) {
      return;
    }

    if (msg.type === "setUser") {
      clients[id].userId = msg.userId;
      if (typeof msg.score === "number") {
        clients[id].score = msg.score;
      } else {
        clients[id].score = 0;
      }
      sendLeaderboard();
    }
  });

  client.on("close", () => {
    delete clients[id];
    sendLeaderboard();
  });
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
  let players = [];
  for (let key in clients) {
    let c = clients[key];
    if (c.userId) {
      players.push({ userId: c.userId, score: c.score || 0 });
    }
  }
  broadcast({ type: "leaderboard", players: players });
}

server.listen(port, "0.0.0.0", () => {});
