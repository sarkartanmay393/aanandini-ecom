import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
    title: 'Anandibi Admin',
    description: 'Admin panel for managing the Anandibi store.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className="min-h-screen">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
