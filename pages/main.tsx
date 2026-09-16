/// <reference types="vite/client" />
import {createRoot, hydrateRoot} from 'react-dom/client';
import Home from '../app/page';
import '../app/globals.css';
import '../app/studio.css';
import '../app/brand.css';
import '../app/experience.css';
import '../app/header.css';

const root = document.getElementById('root')!;
const page = <Home assetBase={import.meta.env.BASE_URL}/>;
if (root.hasChildNodes()) {
  hydrateRoot(root, page);
} else {
  createRoot(root).render(page);
}
