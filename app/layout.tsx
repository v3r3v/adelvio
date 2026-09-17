import type { Metadata } from 'next';
import './globals.css';
import './studio.css';
import './brand.css';
import './experience.css';
import './header.css';
import './refinement.css';


export const metadata: Metadata = {
  metadataBase: new URL('https://adelvio.com'),
  title: 'Adelvio | Estudio digital independiente en Puerto Rico',
  description: 'Buen diseño. Grandes posibilidades. Adelvio es un estudio digital independiente en Puerto Rico que crea sitios web y experiencias digitales conectadas.',
  openGraph: {title: 'Adelvio — Buen diseño. Grandes posibilidades.', description: 'Sitios web y experiencias digitales conectadas. Estudio digital independiente en Puerto Rico.', type: 'website', url: 'https://adelvio.com', images: [{url: 'https://adelvio.com/og.png', alt: 'Identidad de Adelvio, estudio digital independiente en Puerto Rico.'}]},
  twitter: {card: 'summary_large_image', title: 'Adelvio — Buen diseño. Grandes posibilidades.', description: 'Sitios web y experiencias digitales conectadas. Estudio digital independiente en Puerto Rico.', images: ['https://adelvio.com/og.png']},
  icons: {icon: [{url: '/adelvio-symbol.webp', type: 'image/webp'}], apple: '/adelvio-symbol.png'},
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className="studio-site"
      >
        {children}
      </body>
    </html>
  );
}
