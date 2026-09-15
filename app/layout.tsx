import type { Metadata } from 'next';
import './globals.css';
import './studio.css';
import './brand.css';
import './experience.css';


export const metadata: Metadata = {
  metadataBase: new URL('https://adelvio.com'),
  title: 'Adelvio | Independent digital studio in Puerto Rico',
  description: 'Good design. Real possibility. Adelvio is an independent digital studio in Puerto Rico, creating thoughtful websites and connected digital experiences.',
  openGraph: {title: 'Adelvio — Good design. Real possibility.', description: 'Thoughtful websites and connected digital experiences. Independent digital studio, Puerto Rico.', type: 'website', url: 'https://adelvio.com', images: [{url: 'https://adelvio.com/og.png', alt: 'Adelvio. Good design. Real possibility. Independent digital studio, Puerto Rico.'}]},
  twitter: {card: 'summary_large_image', title: 'Adelvio — Good design. Real possibility.', description: 'Thoughtful websites and connected digital experiences. Independent digital studio, Puerto Rico.', images: ['https://adelvio.com/og.png']},
  icons: {icon: [{url: '/adelvio-symbol.webp', type: 'image/webp'}], apple: '/adelvio-symbol.png'},
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="studio-site"
      >
        {children}
      </body>
    </html>
  );
}
