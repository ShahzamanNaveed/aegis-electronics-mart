import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { MessageCircle, Send, X, RotateCcw, ArrowUpRight } from "lucide-react";
import "./assistant.css";

type Source = {
  title: string;
  url: string;
  kind: string;
  excerpt: string;
  price_paisa: number | null;
  stock: number | null;
};
type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  model?: string;
  generated?: boolean;
};
const suggestions = [
  "What are the specs of Work 14?",
  "How do I set up a washing machine?",
  "Show me refrigerators",
];

export function Assistant() {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const controller = useRef<AbortController | null>(null);
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [failed, setFailed] = useState("");

  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest" });
  }, [messages, busy, error]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;
    const abort = new AbortController();
    controller.current = abort;
    setBusy(true);
    setError("");
    setFailed("");
    setDraft("");
    const history = messages
      .slice(-4)
      .map(({ role, content }) => ({ role, content: content.slice(0, 1200) }));
    const pending: Message = { role: "user", content: question };
    setMessages([...messages, pending]);
    const timer = window.setTimeout(() => abort.abort(), 100000);
    try {
      const response = await fetch("/api/v1/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abort.signal,
        body: JSON.stringify({
          message: question,
          history,
          product_slug: location.pathname.startsWith("/products/")
            ? location.pathname.split("/")[2]
            : null,
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(
          body?.error?.message ||
            "We couldn’t reach the assistant. Please try again.",
        );
      }
      const result = await response.json();
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: result.answer,
          sources: result.sources,
          model: result.model,
          generated: result.generated,
        },
      ]);
    } catch (reason) {
      setMessages(messages);
      setFailed(question);
      setError(
        abort.signal.aborted
          ? "The request timed out. Please try again."
          : reason instanceof Error
            ? reason.message
            : "We couldn’t reach the assistant.",
      );
    } finally {
      window.clearTimeout(timer);
      controller.current = null;
      setBusy(false);
      input.current?.focus();
    }
  }

  return (
    <>
      <button
        className="assistant-launch"
        onClick={() => {
          dialog.current?.showModal();
          input.current?.focus();
        }}
      >
        <MessageCircle size={20} aria-hidden="true" /> Ask Aegis
      </button>
      <dialog
        ref={dialog}
        className="assistant-dialog"
        aria-labelledby="assistant-title"
      >
        <div className="assistant-header">
          <div>
            <span className="assistant-eyebrow">A LITTLE HELP, RIGHT HERE</span>
            <h2 id="assistant-title">Ask Aegis</h2>
          </div>
          <div className="assistant-controls">
            <button
              aria-label="Start a new conversation"
              disabled={busy}
              onClick={() => {
                setMessages([]);
                setError("");
                setFailed("");
                setDraft("");
                input.current?.focus();
              }}
            >
              <RotateCcw size={18} />
            </button>
            <button
              aria-label="Close assistant"
              onClick={() => dialog.current?.close()}
            >
              <X size={21} />
            </button>
          </div>
        </div>
        <div
          className="assistant-thread"
          role="log"
          aria-label="Conversation"
          aria-live="polite"
          aria-relevant="additions"
        >
          {!messages.length && (
            <div className="assistant-welcome">
              <MessageCircle size={30} aria-hidden="true" />
              <h3>Find the details that matter.</h3>
              <p>
                Ask about our products, compare specifications, or get help with
                setup and care.
              </p>
              <div className="assistant-suggestions">
                {suggestions.map((text) => (
                  <button
                    key={text}
                    disabled={busy}
                    onClick={() => void send(text)}
                  >
                    {text}
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((message, i) => (
            <article key={i} className={`assistant-message ${message.role}`}>
              <span className="assistant-speaker">
                {message.role === "user" ? "You" : "Aegis"}
              </span>
              <p>{message.content}</p>
              {message.sources && message.sources.length > 0 && (
                <div className="assistant-sources">
                  <span>From the catalog &amp; Help Center</span>
                  {message.sources.map((source) => (
                    <div className="assistant-source" key={source.url}>
                      <Link
                        to={source.url}
                        onClick={() => dialog.current?.close()}
                      >
                        {source.title}
                        <ArrowUpRight size={14} aria-hidden="true" />
                      </Link>
                      {source.price_paisa !== null && (
                        <strong>
                          {new Intl.NumberFormat("en-PK", {
                            style: "currency",
                            currency: "PKR",
                            maximumFractionDigits: 0,
                          }).format(source.price_paisa / 100)}{" "}
                          ·{" "}
                          {source.stock
                            ? `${source.stock} in sample stock`
                            : "Out of stock"}
                        </strong>
                      )}
                      <p>{source.excerpt}</p>
                    </div>
                  ))}
                </div>
              )}
              {message.model && message.generated && (
                <small>
                  AI response · {message.model} · Check the source details.
                </small>
              )}
            </article>
          ))}
          {busy && (
            <p className="assistant-thinking" role="status">
              Checking the catalog and preparing your answer…
            </p>
          )}
          <div ref={end} />
        </div>
        {error && (
          <div className="assistant-error" role="alert">
            <p>{error}</p>
            <button disabled={busy} onClick={() => void send(failed)}>
              Retry question
            </button>
          </div>
        )}
        <form
          className="assistant-compose"
          onSubmit={(event) => {
            event.preventDefault();
            void send(draft);
          }}
        >
          <label htmlFor="assistant-question">Your question</label>
          <div>
            <textarea
              ref={input}
              id="assistant-question"
              rows={2}
              maxLength={600}
              value={draft}
              disabled={busy}
              placeholder="Ask about a product or a help topic…"
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();
                  void send(draft);
                }
              }}
            />
            <button
              type="submit"
              aria-label="Send question"
              disabled={busy || !draft.trim()}
            >
              <Send size={19} />
            </button>
          </div>
          <small>
            AI can make mistakes. Fictional catalog. Don’t share personal
            details.{" "}
            <Link to="/privacy" onClick={() => dialog.current?.close()}>
              Privacy
            </Link>
          </small>
        </form>
      </dialog>
    </>
  );
}
