import type { Metadata } from 'next';
import './globals.css';
import './studio.css';
import './brand.css';


export const metadata: Metadata = {
  metadataBase: new URL('https://web-design-and-care.cebolluin.chatgpt.site'),
  title: 'Websirico | Web design & ongoing care in Puerto Rico',
  description: 'Thoughtful websites for small businesses in Puerto Rico. Clearly scoped website packages and optional ongoing care.',
  openGraph: {title: 'Websirico — Your business. A better first impression.', description: 'Web design & ongoing care for small businesses in Puerto Rico.', type: 'website', url: 'https://web-design-and-care.cebolluin.chatgpt.site', images: [{url: 'https://web-design-and-care.cebolluin.chatgpt.site/og.png', alt: 'Websirico. Web design & ongoing care. Puerto Rico.'}]},
  twitter: {card: 'summary_large_image', title: 'Websirico — Your business. A better first impression.', description: 'Web design & ongoing care for small businesses in Puerto Rico.', images: ['https://web-design-and-care.cebolluin.chatgpt.site/og.png']},
  icons: {icon: '/favicon.svg'},
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
