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

  function getCirclePositionFromId(id) {
    if (!id) {
      return { top: 50, left: 50 };
    }
    let sum1 = 0;
    let sum2 = 0;
    for (let i = 0; i < id.length; i++) {
      const code = id.charCodeAt(i);
      sum1 += code;
      sum2 += code * (i + 1);
    }
    const top = 10 + (sum1 % 80);
    const left = 10 + (sum2 % 80);
    return { top, left };
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

    const taken = leaderboard && leaderboard.some((p) => p.userId === hex);
    if (taken) {
      alert("this hex code is already taken");
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

  function handlePageClick() {
    if (!userId) return;

    const me = leaderboard.find((p) => p.userId === userId);
    const currentScore = me && typeof me.score === "number" ? me.score : 0;
    const newScore = currentScore + 1;

    if (socket && socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(
          JSON.stringify({
            type: "updateScore",
            score: newScore,
          })
        );
      } catch (e) {}
    }
  }

  return (
    <div className="page-container" onClick={handlePageClick}>
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

      {leaderboard && leaderboard.length > 0 && (
        <div className="leaderboard-box">
          {leaderboard.map((p) => (
            <div key={p.userId}>
              {p.userId}: {p.score || 0}
            </div>
          ))}
        </div>
      )}

      {leaderboard &&
        leaderboard.length > 0 &&
        leaderboard.map((p) => {
          const score = p.score || 0;
          const size = 10 + score;

          const pos = getCirclePositionFromId(p.userId);
          const top = pos.top;
          const left = pos.left;

          return (
            <div
              key={"circle-" + p.userId}
              className="color-circle"
              style={{
                backgroundColor: p.userId,
                top: top + "%",
                left: left + "%",
                width: size + "px",
                height: size + "px",
              }}
            ></div>
          );
        })}
    </div>
  );
}
