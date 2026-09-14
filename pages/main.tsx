/// <reference types="vite/client" />
import {createRoot} from 'react-dom/client';
import Home from '../app/page';
import '../app/globals.css';
import '../app/studio.css';
import '../app/brand.css';

createRoot(document.getElementById('root')!).render(<Home assetBase={import.meta.env.BASE_URL}/>);
