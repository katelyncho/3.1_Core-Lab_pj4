import { useState, useEffect } from "react";

export function App() {
  const [userId, setUserId] = useState("");
  const [inputColor, setInputColor] = useState("#ff0000");
  const [score, setScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3000/ws");

    setSocket(ws);

    ws.onopen = () => {
      // nothing here for now, we send setUser after user picks color
    };

    ws.onmessage = (event) => {
      let msg;
      try {
        msg = JSON.parse(event.data);
      } catch (e) {
        return;
      }

      if (msg.type === "leaderboard" && Array.isArray(msg.players)) {
        setLeaderboard(msg.players);
        if (userId) {
          const mine = msg.players.find((p) => p.userId === userId);
          if (mine && typeof mine.score === "number") {
            setScore(mine.score);
          }
        }
      }
    };

    ws.onclose = () => {
      setSocket(null);
    };

    return () => {
      ws.close();
    };
  }, [userId]); // userId here so it can sync score when it changes

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
      alert("please enter a valid hex code like #ff00ff");
      return;
    }

    setUserId(hex);
    setInputColor(hex);

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

  let list = leaderboard;
  if ((!list || list.length === 0) && userId) {
    list = [{ userId: userId, score: score }];
  }

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
          {list && list.length > 0 ? (
            list.map((p) => (
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
