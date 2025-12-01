import { useState, useEffect } from "react";

export function App() {
  const [userId, setUserId] = useState("");
  const [inputColor, setInputColor] = useState("#ff0000");
  const [leaderboard, setLeaderboard] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const host = window.location.hostname || "localhost";
    const ws = new WebSocket("ws://" + host + ":3000/ws");

    setSocket(ws);

    ws.onmessage = (event) => {
      let msg;
      try {
        msg = JSON.parse(event.data);
      } catch (e) {
        return;
      }
      if (msg.type === "leaderboard" && Array.isArray(msg.players)) {
        setLeaderboard(msg.players);
      }
    };

    ws.onclose = () => {
      setSocket(null);
    };

    return () => {
      ws.close();
    };
  }, []);

  function handleColorChange(e) {
    setInputColor(e.target.value);
  }

  function handleTextChange(e) {
    setInputColor(e.target.value);
  }

  function handleSet() {
    let value = inputColor.trim();
    if (!value) return;
    if (!value.startsWith("#")) {
      value = "#" + value;
    }
    const hex = value.toLowerCase();

    const ok = /^#[0-9a-f]{6}$/.test(hex) || /^#[0-9a-f]{3}$/.test(hex);

    if (!ok) {
      alert("please enter a valid hex code");
      return;
    }

    setUserId(hex);

    if (socket && socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(
          JSON.stringify({
            type: "setUser",
            userId: hex,
            score: 0,
          })
        );
      } catch (e) {}
    }
  }

  const playersToShow =
    leaderboard && leaderboard.length
      ? leaderboard
      : userId
      ? [{ userId: userId, score: 0 }]
      : [];

  return (
    <div className="page-container">
      {!userId && (
        <div className="id-box">
          <div>what&apos;s your color?</div>
          <div>
            <input
              type="color"
              value={inputColor}
              onChange={handleColorChange}
            />
          </div>
          <div>
            <input
              type="text"
              value={inputColor}
              onChange={handleTextChange}
              placeholder="#ff00ff"
            />
            <button onClick={handleSet}>set</button>
          </div>
        </div>
      )}

      {userId && (
        <div className="leaderboard-box">
          {playersToShow.length ? (
            playersToShow.map((p) => (
              <div key={p.userId}>
                {p.userId}: {p.score}
              </div>
            ))
          ) : (
            <div>connecting...</div>
          )}
        </div>
      )}
    </div>
  );
}
