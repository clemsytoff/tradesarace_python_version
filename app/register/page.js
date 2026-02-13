import Link from 'next/link';
import RegisterForm from './RegisterForm';

export const metadata = {
  title: 'Register | TRADESARACE Pro',
};

export default function RegisterPage() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Create Account</h1>
        <p>Set up a new TRADESARACE profile.</p>

        <RegisterForm />

        <div className="auth-links">
          <Link href="/login">Already have an account?</Link>
          <Link href="/">Back to market</Link>
        </div>
      </section>
    </main>
  );
}
