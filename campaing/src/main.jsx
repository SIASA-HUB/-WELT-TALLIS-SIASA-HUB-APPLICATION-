import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import App from './App.jsx'

// Helper component to handle the transition
const RootComponent = () => {
  useEffect(() => {
    // This runs once the React component is mounted
    const hideLoader = () => {
      document.body.classList.add('loaded');
    };

    // Small delay ensures the browser has rendered the initial React frame
    const timer = setTimeout(hideLoader, 100);

    return () => clearTimeout(timer);
  }, []);

  return <App />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <RootComponent />
  </StrictMode>
)