import { useState, useRef, useEffect } from "react";
import "./widget.css";

// Generate or retrieve session ID from localStorage
function getSessionId() {
  const key = "eclarx_session_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

function MessageBubble({ role, content }) {
  return (
    <div className={`eclarx-msg eclarx-msg-${role}`}>
      <div className={`eclarx-bubble eclarx-bubble-${role}`}>
        {content}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="eclarx-msg eclarx-msg-assistant">
      <div className="eclarx-bubble eclarx-bubble-assistant eclarx-typing">
        <span className="eclarx-dot" />
        <span className="eclarx-dot" />
        <span className="eclarx-dot" />
      </div>
    </div>
  );
}

export default function ChatWidget({ config }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! How can I help you today? I can answer questions about our firm or help you schedule a consultation.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const sessionId = useRef(getSessionId());

  const MAX_INPUT = 500;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input when chat opens
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    // Add user message to chat
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${config.apiUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId.current,
          message: text,
          firm_id: config.firmId,
        }),
      });

      if (!res.ok) throw new Error("API error");

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const accentColor = config.color;

  return (
    <>
      {/* Chat Panel */}
      {open && (
        <div className="eclarx-panel">
          {/* Header */}
          <div className="eclarx-header" style={{ background: accentColor }}>
            <div className="eclarx-header-info">
              <div className="eclarx-avatar">AI</div>
              <div>
                <div className="eclarx-header-title">Chat Assistant</div>
                <div className="eclarx-header-status">Online</div>
              </div>
            </div>
            <button
              className="eclarx-close"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="eclarx-messages">
            {messages.map((msg, i) => (
              <MessageBubble key={i} role={msg.role} content={msg.content} />
            ))}
            {loading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="eclarx-input-area">
            <div className="eclarx-input-wrap">
              <input
                ref={inputRef}
                type="text"
                className="eclarx-input"
                placeholder="Type a message..."
                value={input}
                onChange={(e) =>
                  e.target.value.length <= MAX_INPUT &&
                  setInput(e.target.value)
                }
                onKeyDown={handleKeyDown}
                disabled={loading}
                maxLength={MAX_INPUT}
              />
              <button
                className="eclarx-send"
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                style={{ background: accentColor }}
                aria-label="Send message"
              >
                &#10148;
              </button>
            </div>
            <div className="eclarx-char-count">
              {input.length}/{MAX_INPUT}
            </div>
          </div>

          {/* Watermark */}
          <div className="eclarx-watermark">
            Powered by <strong>E-Clarx</strong>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        className="eclarx-fab"
        onClick={() => setOpen(!open)}
        style={{ background: accentColor }}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? (
          <span className="eclarx-fab-icon">✕</span>
        ) : (
          <span className="eclarx-fab-icon">💬</span>
        )}
      </button>
    </>
  );
}
