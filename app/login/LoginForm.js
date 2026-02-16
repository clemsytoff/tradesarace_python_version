'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { storeUser } from '../../src/lib/auth-client';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const payload = await response.json();
      if (!response.ok || !payload?.ok) {
        setStatus({
          type: 'error',
          message: payload?.message || 'Login failed.',
        });
        return;
      }

      storeUser(payload.user);
      setStatus({ type: 'success', message: payload.message });
      setTimeout(() => router.push('/'), 700);
    } catch {
      setStatus({ type: 'error', message: 'Network error. Try again.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />

      <label htmlFor="password">Password</label>
      <input
        id="password"
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />

      {status.message && (
        <p className={`auth-message ${status.type === 'error' ? 'error' : 'success'}`}>
          {status.message}
        </p>
      )}

      <button type="submit" className="auth-submit" disabled={isSubmitting}>
        {isSubmitting ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
