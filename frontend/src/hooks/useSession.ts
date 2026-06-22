import { useState, useEffect } from 'react';
import { createOrGetSession, loginUser, registerUser } from '../lib/api';

const SESSION_KEY = 'lumina_session_id';
const EMAIL_KEY = 'lumina_user_email';

function generateSessionId(): string {
  const uuid = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
  return 'sess_' + uuid.replace(/-/g, '');
}

export function useSession() {
  const [sessionId, setSessionId] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    const storedEmail = localStorage.getItem(EMAIL_KEY);
    if (storedEmail) setEmail(storedEmail);

    const id = stored ?? generateSessionId();
    if (!stored) localStorage.setItem(SESSION_KEY, id);

    setSessionId(id);
    createOrGetSession(id)
      .catch(console.error)
      .finally(() => setReady(true));
  }, []);

  const login = async (emailInput: string, passwordInput: string) => {
    const user = await loginUser(emailInput, passwordInput);
    localStorage.setItem(SESSION_KEY, user.sessionId);
    if (user.email) {
      localStorage.setItem(EMAIL_KEY, user.email);
      setEmail(user.email);
    } else {
      localStorage.removeItem(EMAIL_KEY);
      setEmail('');
    }
    setSessionId(user.sessionId);
  };

  const signup = async (emailInput: string, passwordInput: string) => {
    const user = await registerUser(emailInput, passwordInput, sessionId);
    localStorage.setItem(SESSION_KEY, user.sessionId);
    if (user.email) {
      localStorage.setItem(EMAIL_KEY, user.email);
      setEmail(user.email);
    } else {
      localStorage.removeItem(EMAIL_KEY);
      setEmail('');
    }
    setSessionId(user.sessionId);
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(EMAIL_KEY);
    setEmail('');
    const id = generateSessionId();
    localStorage.setItem(SESSION_KEY, id);
    setSessionId(id);
  };

  return { sessionId, email, ready, login, signup, logout };
}
