import { useState, useRef, useEffect } from "react";

const INITIAL_MESSAGE = {
  role: "assistant",
  content:
    "こんにちは、れおです🐨\n英語学習に関する質問、なんでも聞いてください！\n\n例) 「Part5を速く解くコツは？」「リスニングの先読みのやり方は？」",
};

export default function Home() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: "user", content: text };
    const newMessages = [...messages.filter((m) => m.role !== "assistant" || messages.indexOf(m) > 0), userMsg];
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const assistantMsg = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: updated[updated.length - 1].content + parsed.text,
                };
                return updated;
              });
            }
          } catch {}
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: "エラーが発生しました。もう一度お試しください。",
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <header>
        <div className="logo">LeaPASS</div>
        <div className="subtitle">TOEIC攻略アドバイザー</div>
      </header>

      <main className="chat-area">
        {messages.map((msg, i) => (
          <div key={i} className={`bubble-wrap ${msg.role}`}>
            {msg.role === "assistant" && <div className="avatar">LP</div>}
            <div className={`bubble ${msg.role}`}>
              {msg.content.split("\n").map((line, j) => (
                <span key={j}>
                  {line}
                  {j < msg.content.split("\n").length - 1 && <br />}
                </span>
              ))}
              {loading && i === messages.length - 1 && msg.role === "assistant" && msg.content === "" && (
                <span className="typing">...</span>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </main>

      <form className="input-area" onSubmit={sendMessage}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="質問を入力してください..."
          disabled={loading}
          autoFocus
        />
        <button type="submit" disabled={loading || !input.trim()}>
          送信
        </button>
      </form>

      <style jsx>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          max-width: 720px;
          margin: 0 auto;
          font-family: -apple-system, "Hiragino Sans", sans-serif;
          background: #f7f8fa;
        }
        header {
          background: #1a3c5e;
          color: white;
          padding: 16px 20px;
          text-align: center;
        }
        .logo { font-size: 22px; font-weight: 700; letter-spacing: 2px; }
        .subtitle { font-size: 12px; opacity: 0.8; margin-top: 2px; }

        .chat-area {
          flex: 1;
          overflow-y: auto;
          padding: 20px 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .bubble-wrap {
          display: flex;
          gap: 8px;
          align-items: flex-end;
        }
        .bubble-wrap.user { flex-direction: row-reverse; }

        .avatar {
          width: 32px;
          height: 32px;
          background: #1a3c5e;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .bubble {
          max-width: 75%;
          padding: 10px 14px;
          border-radius: 16px;
          line-height: 1.6;
          font-size: 14px;
          white-space: pre-wrap;
          word-break: break-word;
        }
        .bubble.assistant {
          background: white;
          color: #1a1a1a;
          border-bottom-left-radius: 4px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        .bubble.user {
          background: #1a3c5e;
          color: white;
          border-bottom-right-radius: 4px;
        }
        .typing { opacity: 0.5; animation: blink 1s infinite; }
        @keyframes blink { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }

        .input-area {
          display: flex;
          gap: 8px;
          padding: 12px 16px;
          background: white;
          border-top: 1px solid #e5e7eb;
        }
        input {
          flex: 1;
          padding: 10px 14px;
          border: 1.5px solid #d1d5db;
          border-radius: 24px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        input:focus { border-color: #1a3c5e; }
        button {
          padding: 10px 20px;
          background: #1a3c5e;
          color: white;
          border: none;
          border-radius: 24px;
          font-size: 14px;
          cursor: pointer;
          transition: opacity 0.2s;
          white-space: nowrap;
        }
        button:disabled { opacity: 0.4; cursor: not-allowed; }
        button:not(:disabled):hover { opacity: 0.85; }
      `}</style>
    </div>
  );
}
