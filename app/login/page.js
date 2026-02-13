import Link from 'next/link';
import LoginForm from './LoginForm';

export const metadata = {
  title: 'Login | TRADESARACE Pro',
};

export default function LoginPage() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Login</h1>
        <p>Access your trading workspace.</p>

        <LoginForm />

        <div className="auth-links">
          <Link href="/register">Create an account</Link>
          <Link href="/">Back to market</Link>
        </div>
      </section>
    </main>
  );
}
