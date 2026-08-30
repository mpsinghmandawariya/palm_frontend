import { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp, Send, MessageSquare, Shield, X } from "lucide-react";
import { useToast } from "../context/ToastContext";

export default function HelpDrawer({ isOpen, onClose }) {
  const toast = useToast();
  const [openFaq, setOpenFaq] = useState(null);
  const [ticketMessage, setTicketMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const faqs = [
    {
      q: "How does contactless Palm Biometric pay work?",
      a: "Palm Pay utilizes Google MediaPipe Hand landmarks and a fine-tuned MobileNetV2 deep learning architecture to extract a 1280-dimensional biometric dermal feature vector. In live checkouts, real-time cosine similarity validates your palm against your encrypted profile.",
    },
    {
      q: "What if low lighting causes biometric match to fail?",
      a: "If lighting is poor or anti-spoof checks require secondary verification, Palm Pay provides an immediate 4-digit Security PIN fallback, ensuring you are never locked out.",
    },
    {
      q: "Are my palm images stored on cloud servers?",
      a: "No raw palm photos are ever stored in cleartext. Palm scans are converted into irreversible mathematical normalized vectors before storage.",
    },
    {
      q: "How do I withdraw wallet funds to my bank?",
      a: "Tap 'Withdraw' on your Dashboard, select your linked bank account, enter the amount, and funds will instantly settle to your bank account.",
    },
  ];

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    if (!ticketMessage.trim()) return;

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setTicketMessage("");
      toast.success("Support ticket created! Case #PP-9942 opened.");
      onClose();
    }, 600);
  };

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Help and Support Center">
        <div className="drawer-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <HelpCircle size={20} />
            <h3 style={{ fontSize: "16px", fontWeight: "700" }}>Help & Support Center</h3>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close help drawer">
            <X size={18} />
          </button>
        </div>

        <div className="drawer-content" style={{ padding: "16px" }}>
          <h4 style={{ fontSize: "14px", marginBottom: "12px", color: "var(--text-primary)" }}>Frequently Asked Questions</h4>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
            {faqs.map((faq, idx) => (
              <div key={idx} className="faq-accordion-item">
                <button
                  className="faq-question-btn"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  aria-expanded={openFaq === idx}
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {openFaq === idx && <div className="faq-answer-box">{faq.a}</div>}
              </div>
            ))}
          </div>

          <h4 style={{ fontSize: "14px", marginBottom: "12px", color: "var(--text-primary)" }}>Contact Enterprise Support</h4>
          <form onSubmit={handleTicketSubmit} className="support-ticket-form">
            <textarea
              placeholder="Describe your issue or query..."
              value={ticketMessage}
              onChange={(e) => setTicketMessage(e.target.value)}
              rows="3"
              required
              className="form-input"
              style={{ width: "100%", marginBottom: "10px", resize: "none" }}
            />
            <button type="submit" className="btn-primary" disabled={submitting} style={{ width: "100%" }}>
              <Send size={15} style={{ marginRight: "6px" }} />
              {submitting ? "Submitting..." : "Submit Support Request"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
