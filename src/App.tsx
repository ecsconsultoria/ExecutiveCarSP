import { useEffect } from 'react';
import { AppRoutes } from './routes';
import { initializeDefaultSettings } from './db';

function App() {
  useEffect(() => {
    initializeDefaultSettings();
  }, []);

  return <AppRoutes />;
}

export default App;
