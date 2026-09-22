import './globals.css';

export const metadata = {
  title: 'URL Shortener',
  description: 'A modern URL shortener application',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
