import { useState } from "react";
import API from "../services/api";

export default function AiAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([
    { sender: "ai", text: "👋 Hi! I'm your EasyPay AI Financial Assistant. Ask me about your spending, largest expenses, or AutoPay bills!" },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg = query.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setQuery("");
    setLoading(true);

    try {
      const response = await API.post("/ai/assistant/query", { query: userMsg });
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: response.data?.answer || "I parsed your financial data." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Unable to query financial records right now. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* FLOATING AI ASSISTANT TRIGGER BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: "85px",
          right: "20px",
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #111111 0%, #374151 100%)",
          color: "#ffffff",
          fontSize: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
          zIndex: 90,
          border: "2px solid #ffffff",
        }}
        title="AI Assistant"
      >
        🤖
      </button>

      {/* CHAT DRAWER MODAL */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "150px",
            right: "20px",
            width: "min(360px, calc(100vw - 40px))",
            height: "440px",
            background: "#ffffff",
            borderRadius: "24px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            border: "1.5px solid #ece7df",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 100,
          }}
        >
          {/* HEADER */}
          <div style={{ background: "#111111", color: "white", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "20px" }}>🤖</span>
              <div>
                <strong style={{ fontSize: "14px", display: "block" }}>EasyPay AI Assistant</strong>
                <span style={{ fontSize: "10px", opacity: 0.7 }}>Financial Intelligence</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: "none", color: "white", fontSize: "20px", padding: 0 }}>×</button>
          </div>

          {/* MESSAGES CONTAINER */}
          <div style={{ flex: 1, padding: "14px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", background: "#f8f6f2" }}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
                  background: m.sender === "user" ? "#111111" : "#ffffff",
                  color: m.sender === "user" ? "#ffffff" : "#111111",
                  padding: "10px 14px",
                  borderRadius: "16px",
                  fontSize: "13px",
                  maxWidth: "85%",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                  lineHeight: "1.4",
                }}
              >
                {m.text}
              </div>
            ))}
            {loading && <div style={{ fontSize: "12px", color: "#767676", fontStyle: "italic" }}>AI is analyzing ledger...</div>}
          </div>

          {/* INPUT FORM */}
          <form onSubmit={handleSend} style={{ display: "flex", padding: "10px", background: "white", borderTop: "1px solid #ece7df" }}>
            <input
              type="text"
              placeholder="Ask e.g. What did I spend?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ fontSize: "13px", padding: "10px 12px", borderRadius: "12px 0 0 12px", borderRight: "none" }}
            />
            <button type="submit" className="btn-black" style={{ width: "auto", borderRadius: "0 12px 12px 0", padding: "10px 16px", fontSize: "13px" }}>
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
