import type { Metadata } from 'next';
import './globals.css';
import './studio.css';


export const metadata: Metadata = {
  metadataBase: new URL('https://web-design-and-care.pink-clove-9620.chatgpt.site'),
  title: 'Web design & ongoing care | Puerto Rico',
  description: 'Thoughtful websites for small businesses in Puerto Rico. Clearly scoped website packages and optional ongoing care.',
  openGraph: {title: 'Your business. A better first impression.', description: 'Web design & ongoing care for small businesses in Puerto Rico.', type: 'website', url: 'https://web-design-and-care.pink-clove-9620.chatgpt.site', images: [{url: 'https://web-design-and-care.pink-clove-9620.chatgpt.site/og.png', alt: 'Your business. A better first impression. Web design & ongoing care.'}]},
  twitter: {card: 'summary_large_image', title: 'Your business. A better first impression.', description: 'Web design & ongoing care for small businesses in Puerto Rico.', images: ['https://web-design-and-care.pink-clove-9620.chatgpt.site/og.png']},
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
