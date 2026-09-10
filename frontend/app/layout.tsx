import type { Metadata } from 'next';
import '../src/index.css';

export const metadata: Metadata = {
  title: 'Kabisig SK Information System',
  description: 'Frontend portal for Sangguniang Kabataan councils in Naga City.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}