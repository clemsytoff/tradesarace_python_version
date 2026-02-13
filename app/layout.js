import './globals.css';
import '../src/index.css';
import '../src/App.css';

export const metadata = {
  title: 'TRADESARACE Pro',
  description: 'Crypto perpetual simulator',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
