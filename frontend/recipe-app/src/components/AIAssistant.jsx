import { useState } from "react";
import "./AIAssistant.css";

function AIAssistant({ recipeId }) {
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    "What are some healthy substitutes for ingredients here?",
    "How can I make this recipe gluten-free/vegan?",
    "What side dishes or wine pairings go well with this?",
    "Give me tips to make this recipe faster or prep ahead."
  ];

  const handleSubmit = async (e, customPrompt = null) => {
    if (e) e.preventDefault();
    
    const activePrompt = customPrompt || prompt;
    if (!activePrompt.trim()) return;

    setLoading(true);
    setAnswer("");
    try {
      const res = await fetch(`/api/ai/assist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({ recipeId, prompt: activePrompt }),
      });
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setAnswer(data.answer || (data.success ? data.answer : "No response from AI"));
    } catch (err) {
      console.error(err);
      setAnswer("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPromptClick = (p) => {
    setPrompt(p);
    handleSubmit(null, p);
  };

  return (
    <div className="ai-assistant-wrapper">
      <div className="ai-header">
        <span className="ai-badge">🤖 AI Sous Chef</span>
        <p className="ai-subtitle">Ask anything about this recipe or tap a quick question below:</p>
      </div>

      <div className="quick-prompts-grid">
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            className="quick-prompt-pill"
            onClick={() => handleQuickPromptClick(p)}
            disabled={loading}
          >
            {p}
          </button>
        ))}
      </div>

      <form onSubmit={(e) => handleSubmit(e)} className="ai-form-container">
        <textarea
          className="ai-textarea-input"
          placeholder="Or type your own question here... (e.g., 'Can I use butter instead of coconut oil?')"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          required
          disabled={loading}
        />
        <button type="submit" className="ai-submit-button" disabled={loading || !prompt.trim()}>
          {loading ? "Chef is thinking..." : "Ask Chef"}
        </button>
      </form>

      {answer && (
        <div className="ai-response-box">
          <h4 className="ai-response-title">Chef's Advice:</h4>
          <p className="ai-response-text">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default AIAssistant;
