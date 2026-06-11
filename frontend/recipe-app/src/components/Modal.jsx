import React, { useState, useEffect, useRef } from "react";
import "./Modal.css";

function Modal({ isOpen, onClose, onLoginSuccess, children }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const submitRef = useRef(null);

  // focus on submit button when modal opens
  useEffect(() => {
    if (isOpen && submitRef.current) {
      submitRef.current.focus();
    }
  }, [isOpen]);

  // Reset form inputs when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setUsername("");
      setEmail("");
      setPassword("");
      setIsRegister(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isRegister ? "/api/users" : "/api/users/signin";
    const payload = isRegister ? { username, email, password } : { email, password };

    console.log(isRegister ? "Registering" : "Logging in", payload);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || (isRegister ? "Registration failed" : "Login failed"));
      }
      const data = await res.json();
      console.log(isRegister ? "Registration success" : "Login success", data);
      if (onLoginSuccess) onLoginSuccess(data.token);
    } catch (err) {
      console.error(err);
      alert(err.message);
      return;
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{isRegister ? "Register" : "Login"}</h2>
        <form onSubmit={handleSubmit} className="login-form">
          {isRegister && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="modal-input"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="modal-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="modal-input"
          />
          <button type="submit" ref={submitRef} className="modal-submit">
            {isRegister ? "Sign Up" : "Sign In"}
          </button>
        </form>
        <p className="modal-toggle-text">
          {isRegister ? "Already have an account?" : "Don't have an account?"}
          <span className="modal-toggle-link" onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? "Sign In" : "Sign Up"}
          </span>
        </p>
        {children}
        <button className="modal-close" onClick={onClose}>✕</button>
      </div>
    </div>
  );
}

export default Modal;
