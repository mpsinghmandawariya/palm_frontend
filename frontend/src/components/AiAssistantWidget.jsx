import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Sparkles, ShieldAlert } from "lucide-react";
import API from "../services/api";

export default function AiAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "👋 Hi! I'm your Palm Pay AI Financial Intelligence Assistant. Ask me about your spending breakdown, highest expenses, or upcoming AutoPay mandates!",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    const userMsg = query.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setQuery("");
    setLoading(true);

    try {
      const response = await API.post("/ai/assistant/query", { query: userMsg });
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: response.data?.answer || "I parsed your financial ledger." },
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

  const quickPrompts = [
    "What did I spend this month?",
    "Show my highest expense",
    "Any AutoPay bills scheduled?",
  ];

  return (
    <>
      {/* FLOATING AI ASSISTANT TRIGGER BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="ai-floating-trigger"
        title="AI Financial Assistant"
        aria-label="Open AI Financial Assistant"
      >
        <Bot size={24} />
      </button>

      {/* CHAT DRAWER MODAL */}
      {isOpen && (
        <div className="ai-chat-drawer" role="dialog" aria-modal="true" aria-label="AI Financial Assistant Chat">
          {/* HEADER */}
          <div className="ai-chat-header">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="ai-header-badge">
                <Bot size={18} />
              </div>
              <div>
                <strong style={{ fontSize: "14px", display: "block" }}>Palm Pay AI Assistant</strong>
                <span style={{ fontSize: "11px", opacity: 0.8, display: "flex", alignItems: "center", gap: "4px" }}>
                  <Sparkles size={11} /> Real-time Financial NLP
                </span>
              </div>
            </div>
            <button className="btn-icon" onClick={() => setIsOpen(false)} aria-label="Close chat" style={{ color: "white" }}>
              <X size={18} />
            </button>
          </div>

          {/* QUICK PROMPT CHIPS */}
          <div className="ai-quick-prompts-bar">
            {quickPrompts.map((p) => (
              <button
                key={p}
                className="ai-chip-btn"
                onClick={() => {
                  setQuery(p);
                }}
              >
                {p}
              </button>
            ))}
          </div>

          {/* MESSAGES CONTAINER */}
          <div className="ai-messages-container">
            {messages.map((m, idx) => (
              <div key={idx} className={`ai-message-bubble ${m.sender === "user" ? "user" : "assistant"}`}>
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="ai-typing-indicator">
                <div className="ai-dot" />
                <div className="ai-dot" />
                <div className="ai-dot" />
                <span>AI analyzing ledger...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* INPUT FORM */}
          <form onSubmit={handleSend} className="ai-input-form">
            <input
              type="text"
              placeholder="Ask e.g. What did I spend on bills?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="ai-text-input"
            />
            <button type="submit" className="ai-send-btn" disabled={!query.trim() || loading} aria-label="Send message">
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
