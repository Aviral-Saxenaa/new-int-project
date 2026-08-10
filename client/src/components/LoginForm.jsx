import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginForm = () => {
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const name = username.trim();

    if (name.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signIn(name);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-brand">
          <span className="brand-badge large">💬</span>
          <h1 className="login-title">Chatify</h1>
          <p className="login-subtitle">A real-time chat built with React, Socket.io &amp; PostgreSQL</p>
        </div>

        <form className="login-form" onSubmit={submit}>
          <label className="login-label" htmlFor="username">Choose your username</label>
          <input
            id="username"
            className="login-input"
            type="text"
            value={username}
            placeholder="e.g. aviral"
            maxLength={30}
            autoFocus
            autoComplete="off"
            onChange={(e) => {
              setUsername(e.target.value);
              setError('');
            }}
          />

          {error && <p className="login-error" role="alert">{error}</p>}

          <button className="login-button" type="submit" disabled={loading}>
            {loading ? 'Joining…' : 'Join the chat'}
          </button>
        </form>

        <p className="login-hint">No sign-up needed — just pick a username and start chatting.</p>
      </div>
    </div>
  );
};

export default LoginForm;
